import { prisma } from "./prisma";

/**
 * ShelfShare's recommendation engine.
 *
 * The idea is intentionally simple and fully transparent — no ML, no
 * embeddings, just counting. It works in three steps:
 *
 *   1. PREFERENCE MAP: look at every item the user rated 4 or 5 stars,
 *      and count how many times each tag appears across those items.
 *      This gives us a map like { "Sci-Fi": 3, "Slow Burn": 2, ... } —
 *      essentially "how much does this user seem to like each tag".
 *
 *   2. SCORING: for every item the user has NOT already added to their
 *      list, sum up the preference weight of its tags. An item with two
 *      tags the user loves scores higher than an item with one tag they
 *      sort-of like.
 *
 *   3. RANKING: sort by score, descending, and return the top N — along
 *      with *why* each item was recommended, so the UI (and the video!)
 *      can show the reasoning instead of a black box.
 */

export type Recommendation = {
  itemId: string;
  title: string;
  type: string;
  description: string;
  score: number;
  reasons: { tag: string; weight: number; sourceItemTitle: string }[];
};

export async function getRecommendationsForUser(
  userId: string,
  limit = 8
): Promise<Recommendation[]> {
  // Step 1 — build the tag preference map from items rated 4 or 5.
  const likedUserItems = await prisma.userItem.findMany({
    where: { userId, status: "DONE", rating: { gte: 4 } },
    include: { item: { include: { tags: { include: { tag: true } } } } },
  });

  // tagName -> { weight, sourceItemTitle } (keep the first source item as the "why")
  const preference = new Map<
    string,
    { weight: number; sourceItemTitle: string }
  >();

  for (const ui of likedUserItems) {
    for (const it of ui.item.tags) {
      const tagName = it.tag.name;
      const existing = preference.get(tagName);
      if (existing) {
        existing.weight += 1;
      } else {
        preference.set(tagName, { weight: 1, sourceItemTitle: ui.item.title });
      }
    }
  }

  // No signal yet (new user, nothing rated) — nothing to recommend.
  if (preference.size === 0) return [];

  // Items already on the user's list should be excluded.
  const alreadyListed = await prisma.userItem.findMany({
    where: { userId },
    select: { itemId: true },
  });
  const excludeIds = new Set(alreadyListed.map((u) => u.itemId));

  // Step 2 — score every remaining item.
  const candidateItems = await prisma.item.findMany({
    where: { id: { notIn: [...excludeIds] } },
    include: { tags: { include: { tag: true } } },
  });

  const scored: Recommendation[] = candidateItems
    .map((item) => {
      const reasons: Recommendation["reasons"] = [];
      let score = 0;

      for (const it of item.tags) {
        const pref = preference.get(it.tag.name);
        if (pref) {
          score += pref.weight;
          reasons.push({
            tag: it.tag.name,
            weight: pref.weight,
            sourceItemTitle: pref.sourceItemTitle,
          });
        }
      }

      return {
        itemId: item.id,
        title: item.title,
        type: item.type,
        description: item.description,
        score,
        // Show the strongest-weighted reasons first.
        reasons: reasons.sort((a, b) => b.weight - a.weight),
      };
    })
    // Step 3 — only keep items with an actual tag overlap, ranked by score.
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}
