"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import BookmarkRating from "@/components/BookmarkRating";

type Item = {
  id: string;
  title: string;
  type: "BOOK" | "SHOW";
  description: string;
  tags: { tag: { name: string } }[];
};

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const { status: authStatus } = useSession();
  const [item, setItem] = useState<Item | null>(null);
  const [status, setStatus] = useState<"WANT" | "IN_PROGRESS" | "DONE">("WANT");
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/items/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setItem);

    if (authStatus === "authenticated") {
      fetch("/api/user-items")
        .then((r) => r.json())
        .then((list) => {
          const ui = list.find((u: any) => u.item.id === params.id);
          if (ui) {
            setStatus(ui.status);
            setRating(ui.rating);
          }
        });
    }
  }, [params.id, authStatus]);

  async function updateStatus(newStatus: typeof status) {
    setStatus(newStatus);
    await fetch("/api/user-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: params.id, status: newStatus, rating }),
    });
  }

  async function updateRating(newRating: number) {
    setRating(newRating);
    await fetch("/api/user-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: params.id, status, rating: newRating }),
    });
  }

  if (!item) return <p className="pt-16 text-ink/60">Loading…</p>;

  return (
    <div className="pt-12 max-w-xl">
      <div className="text-xs uppercase tracking-wide text-rust mb-2">
        {item.type === "BOOK" ? "Book" : "Show"}
      </div>
      <h1 className="font-display text-4xl mb-3">{item.title}</h1>
      <div className="flex flex-wrap gap-1 mb-4">
        {item.tags.map((t) => (
          <span key={t.tag.name} className="tag-stamp">
            {t.tag.name}
          </span>
        ))}
      </div>
      <p className="text-ink/70 leading-relaxed mb-8">{item.description}</p>

      {authStatus === "authenticated" ? (
        <div className="bg-white border border-ink/10 rounded-spine p-5 space-y-4">
          <div>
            <label className="text-sm text-ink/60 block mb-2">Status</label>
            <div className="flex gap-2">
              {(["WANT", "IN_PROGRESS", "DONE"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={`px-3 py-1.5 rounded-spine text-sm border ${
                    status === s
                      ? "bg-rust text-paper border-rust"
                      : "border-ink/20 hover:border-ink"
                  }`}
                >
                  {s === "WANT" ? "Want to" : s === "IN_PROGRESS" ? "In progress" : "Done"}
                </button>
              ))}
            </div>
          </div>

          {status === "DONE" && (
            <div>
              <label className="text-sm text-ink/60 block mb-2">Your rating</label>
              <BookmarkRating value={rating} onChange={updateRating} />
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-ink/50">Log in to add this to your shelf.</p>
      )}
    </div>
  );
}
