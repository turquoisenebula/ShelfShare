import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/items?q=search+term
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const items = await prisma.item.findMany({
    where: q ? { title: { contains: q, mode: "insensitive" } } : undefined,
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

// POST /api/items — add a new item, creating tags on the fly
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { title, type, description, tags } = await req.json();
  if (!title || !type || !description) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const tagNames: string[] = (tags ?? [])
    .map((t: string) => t.trim())
    .filter(Boolean);

  const item = await prisma.item.create({
    data: {
      title,
      type,
      description,
      coverSeed: title,
      tags: {
        create: await Promise.all(
          tagNames.map(async (name) => {
            const tag = await prisma.tag.upsert({
              where: { name },
              update: {},
              create: { name },
            });
            return { tag: { connect: { id: tag.id } } };
          })
        ),
      },
    },
    include: { tags: { include: { tag: true } } },
  });

  return NextResponse.json(item);
}
