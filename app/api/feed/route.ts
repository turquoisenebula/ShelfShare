import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/feed — recent In Progress / Done activity from people the user follows,
// grouped by user, most recently updated first.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const follows = await prisma.follow.findMany({
    where: { followerId: (session.user as any).id },
    select: { followingId: true },
  });
  const followingIds = follows.map((f) => f.followingId);

  if (followingIds.length === 0) return NextResponse.json([]);

  const userItems = await prisma.userItem.findMany({
    where: { userId: { in: followingIds }, status: { in: ["IN_PROGRESS", "DONE"] } },
    include: {
      user: { select: { name: true, username: true } },
      item: { include: { tags: { include: { tag: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 40,
  });

  // Group by user so the feed reads as "shelves", not a flat activity log.
  const grouped = new Map<string, { name: string; username: string; items: typeof userItems }>();
  for (const ui of userItems) {
    const key = ui.user.username;
    if (!grouped.has(key)) {
      grouped.set(key, { name: ui.user.name, username: ui.user.username, items: [] });
    }
    grouped.get(key)!.items.push(ui);
  }

  return NextResponse.json(Array.from(grouped.values()));
}
