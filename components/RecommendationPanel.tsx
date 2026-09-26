"use client";

import { useState } from "react";
import Link from "next/link";
import type { Recommendation } from "@/lib/recommendations";

export default function RecommendationPanel({ recs }: { recs: Recommendation[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (recs.length === 0) {
    return (
      <section className="mb-12 bg-stamp/60 border border-ink/10 rounded-spine p-6">
        <h2 className="font-display text-xl mb-2">Recommended for you</h2>
        <p className="text-sm text-ink/70">
          Rate a few things 4 or 5 stars once you finish them, and this shelf
          will fill in with suggestions based on what you liked.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-12 bg-rust/10 border border-rust/30 rounded-spine p-6">
      <h2 className="font-display text-xl mb-1">Recommended for you</h2>
      <p className="text-sm text-ink/60 mb-4">
        Based on what you've rated highly — hover a card to see why.
      </p>
      <div className="shelf-row">
        {recs.map((r) => (
          <Link
            href={`/item/${r.itemId}`}
            key={r.itemId}
            onMouseEnter={() => setHovered(r.itemId)}
            onMouseLeave={() => setHovered(null)}
            className="shelf-card shrink-0 w-52 bg-white rounded-spine shadow-sm p-4 relative"
          >
            <div className="text-xs uppercase tracking-wide text-rust mb-1">
              {r.type === "BOOK" ? "Book" : "Show"}
            </div>
            <div className="font-display text-base mb-2">{r.title}</div>

            {hovered === r.itemId ? (
              <div className="text-xs text-ink/70 border-t border-ink/10 pt-2 mt-2">
                because you liked{" "}
                <span className="text-rust font-medium">
                  {r.reasons[0]?.tag}
                </span>{" "}
                in {r.reasons[0]?.sourceItemTitle}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {r.reasons.slice(0, 2).map((rs) => (
                  <span key={rs.tag} className="tag-stamp">
                    {rs.tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
