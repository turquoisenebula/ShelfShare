"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ShelfSection from "@/components/ShelfSection";
import PeopleSearch from "@/components/PeopleSearch";

type FeedGroup = {
  name: string;
  username: string;
  items: {
    item: { id: string; title: string; type: "BOOK" | "SHOW"; tags: { tag: { name: string } }[] };
  }[];
};

export default function FeedPage() {
  const { status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<FeedGroup[] | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/feed")
        .then((r) => r.json())
        .then(setGroups);
    }
  }, [status]);

  if (!groups) return <p className="pt-16 text-ink/60">Loading your feed…</p>;

  return (
    <div className="pt-12">
      <h1 className="font-display text-3xl mb-2">Following</h1>
      <p className="text-ink/60 mb-8">
        What the people you follow are reading and watching.
      </p>

      <PeopleSearch />

      {groups.length === 0 && (
        <p className="text-ink/60">
          You're not following anyone yet. Visit a public profile (e.g. via a
          shared link) and hit Follow to see their shelf here.
        </p>
      )}

      {groups.map((g) => (
        <div key={g.username} className="mb-10">
          <Link href={`/u/${g.username}`} className="hover:text-rust transition-colors">
            <h2 className="font-display text-xl mb-3">{g.name}'s shelf</h2>
          </Link>
          <ShelfSection
            title=""
            items={g.items.map((ui) => ({
              id: ui.item.id,
              title: ui.item.title,
              type: ui.item.type,
              tags: ui.item.tags.map((t) => t.tag.name),
            }))}
          />
        </div>
      ))}
    </div>
  );
}
