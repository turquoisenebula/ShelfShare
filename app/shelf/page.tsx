"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ShelfSection from "@/components/ShelfSection";
import RecommendationPanel from "@/components/RecommendationPanel";
import AddItemForm from "@/components/AddItemForm";
import TagFilter from "@/components/TagFilter";
import type { Recommendation } from "@/lib/recommendations";

type UserItem = {
  id: string;
  status: "WANT" | "IN_PROGRESS" | "DONE";
  item: {
    id: string;
    title: string;
    type: "BOOK" | "SHOW";
    tags: { tag: { name: string } }[];
  };
};

export default function ShelfPage() {
  const { status } = useSession();
  const router = useRouter();
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function refresh() {
    const [uiRes, recRes] = await Promise.all([
      fetch("/api/user-items"),
      fetch("/api/recommendations"),
    ]);
    setUserItems(await uiRes.json());
    setRecs(await recRes.json());
    setLoading(false);
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") refresh();
  }, [status]);

  if (status !== "authenticated" || loading) {
    return <p className="pt-16 text-ink/60">Loading your shelf…</p>;
  }

  const toCard = (ui: UserItem) => ({
    id: ui.item.id,
    title: ui.item.title,
    type: ui.item.type,
    tags: ui.item.tags.map((t) => t.tag.name),
  });

  const allTags = Array.from(
    new Set(userItems.flatMap((u) => u.item.tags.map((t) => t.tag.name)))
  ).sort();

  const matchesFilter = (ui: UserItem) =>
    activeTags.length === 0 ||
    ui.item.tags.some((t) => activeTags.includes(t.tag.name));

  const want = userItems.filter((u) => u.status === "WANT" && matchesFilter(u)).map(toCard);
  const inProgress = userItems
    .filter((u) => u.status === "IN_PROGRESS" && matchesFilter(u))
    .map(toCard);
  const done = userItems.filter((u) => u.status === "DONE" && matchesFilter(u)).map(toCard);

  return (
    <div className="pt-12">
      <h1 className="font-display text-3xl mb-8">My shelf</h1>

      <RecommendationPanel recs={recs} />

      <AddItemForm onAdded={refresh} />

      <TagFilter
        allTags={allTags}
        activeTags={activeTags}
        onToggle={toggleTag}
        onClear={() => setActiveTags([])}
      />

      <ShelfSection title="In progress" items={inProgress} />
      <ShelfSection title="Want to" items={want} />
      <ShelfSection title="Done" items={done} />

      {userItems.length === 0 && (
        <p className="text-ink/60">
          Your shelf is empty. Search above to add the first thing you're
          reading or watching.
        </p>
      )}

      {userItems.length > 0 &&
        activeTags.length > 0 &&
        want.length === 0 &&
        inProgress.length === 0 &&
        done.length === 0 && (
          <p className="text-ink/60">Nothing on your shelf matches that filter.</p>
        )}
    </div>
  );
}
