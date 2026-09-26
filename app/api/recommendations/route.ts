import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecommendationsForUser } from "@/lib/recommendations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const recs = await getRecommendationsForUser((session.user as any).id);
  return NextResponse.json(recs);
}
