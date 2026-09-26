import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, username, email, password } = await req.json();

  if (!name || !username || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "That email or username is already taken." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, username, email, passwordHash },
  });

  return NextResponse.json({ id: user.id, username: user.username });
}
