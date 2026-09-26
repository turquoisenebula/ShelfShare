import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public shelf view — only shows In Progress and Done, never private "Want to" clutter.
export async function GET(
  _req: Request,
  { params }: { params: { username: string } }
) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { name: true, username: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userItems = await prisma.userItem.findMany({
    where: {
      user: { username: params.username },
      status: { in: ["IN_PROGRESS", "DONE"] },
    },
    include: { item: { include: { tags: { include: { tag: true } } } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ user, userItems });
}
