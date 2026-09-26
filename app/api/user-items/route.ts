import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/user-items — the logged-in user's full list, grouped by status
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const userItems = await prisma.userItem.findMany({
    where: { userId: (session.user as any).id },
    include: { item: { include: { tags: { include: { tag: true } } } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(userItems);
}

// POST /api/user-items — add an item to the user's list, or update status/rating
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { itemId, status, rating } = await req.json();
  if (!itemId) {
    return NextResponse.json({ error: "itemId is required." }, { status: 400 });
  }

  // Ratings only make sense once something is marked Done.
  const safeRating = status === "DONE" ? rating ?? null : null;

  const userItem = await prisma.userItem.upsert({
    where: {
      userId_itemId: { userId: (session.user as any).id, itemId },
    },
    update: { status: status ?? undefined, rating: safeRating },
    create: {
      userId: (session.user as any).id,
      itemId,
      status: status ?? "WANT",
      rating: safeRating,
    },
  });

  return NextResponse.json(userItem);
}
