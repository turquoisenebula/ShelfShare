"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ShelfSection from "@/components/ShelfSection";

type UserItem = {
  status: "IN_PROGRESS" | "DONE";
  rating: number | null;
  item: { id: string; title: string; type: "BOOK" | "SHOW"; tags: { tag: { name: string } }[] };
};

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const { data: session, status: authStatus } = useSession();
  const [data, setData] = useState<{ user: { name: string; username: string }; userItems: UserItem[] } | null>(null);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/${params.username}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData);

    if (authStatus === "authenticated") {
      fetch(`/api/follow?username=${params.username}`)
        .then((r) => r.json())
        .then((d) => setFollowing(!!d.following));
    }
  }, [params.username, authStatus]);

  async function toggleFollow() {
    setFollowLoading(true);
    const res = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: params.username }),
    });
    const d = await res.json();
    setFollowing(!!d.following);
    setFollowLoading(false);
  }

  const isOwnProfile =
    authStatus === "authenticated" && (session?.user as any)?.username === params.username;

  if (!data) return <p className="pt-16 text-ink/60">Loading…</p>;

  const toCard = (ui: UserItem) => ({
    id: ui.item.id,
    title: ui.item.title,
    type: ui.item.type,
    tags: ui.item.tags.map((t) => t.tag.name),
  });

  const inProgress = data.userItems.filter((u) => u.status === "IN_PROGRESS").map(toCard);
  const done = data.userItems.filter((u) => u.status === "DONE").map(toCard);

  return (
    <div className="pt-16">
      <p className="tag-stamp mb-4">Public shelf</p>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl mb-2">{data.user.name}'s shelf</h1>
          <p className="text-ink/60">@{data.user.username}</p>
        </div>
        {authStatus === "authenticated" && !isOwnProfile && (
          <button
            onClick={toggleFollow}
            disabled={followLoading}
            className={`px-4 py-2 rounded-spine text-sm transition-colors ${
              following
                ? "border border-ink/20 hover:border-rust hover:text-rust"
                : "bg-rust text-paper hover:bg-ink"
            }`}
          >
            {following ? "Following" : "Follow"}
          </button>
        )}
      </div>

      <ShelfSection title="In progress" items={inProgress} />
      <ShelfSection title="Done" items={done} />

      {data.userItems.length === 0 && (
        <p className="text-ink/60">Nothing shared here yet.</p>
      )}
    </div>
  );
}
