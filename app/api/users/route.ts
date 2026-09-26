import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users?q=search+term — search people by name or username.
// Returns each match's follow status relative to the logged-in user (if any).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);

  const session = await getServerSession(authOptions);
  const selfId = session ? (session.user as any).id : null;

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
      ],
      ...(selfId ? { id: { not: selfId } } : {}),
    },
    select: { id: true, name: true, username: true },
    take: 10,
  });

  if (!selfId) {
    return NextResponse.json(users.map((u) => ({ ...u, following: false })));
  }

  const follows = await prisma.follow.findMany({
    where: { followerId: selfId, followingId: { in: users.map((u) => u.id) } },
    select: { followingId: true },
  });
  const followingSet = new Set(follows.map((f) => f.followingId));

  return NextResponse.json(
    users.map((u) => ({ ...u, following: followingSet.has(u.id) }))
  );
}
