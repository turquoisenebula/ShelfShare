import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/follow?username=jonah — is the logged-in user following this person?
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ following: false });

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: (session.user as any).id,
        followingId: target.id,
      },
    },
  });

  return NextResponse.json({ following: !!existing });
}

// POST /api/follow — toggle follow for { username }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { username } = await req.json();
  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const followerId = (session.user as any).id;
  if (target.id === followerId) {
    return NextResponse.json({ error: "You can't follow yourself." }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: target.id } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  } else {
    await prisma.follow.create({ data: { followerId, followingId: target.id } });
    return NextResponse.json({ following: true });
  }
}
