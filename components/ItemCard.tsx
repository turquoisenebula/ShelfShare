"use client";

import Link from "next/link";

// Deterministically derive a muted color from a string, so each item gets
// a consistent placeholder "cover" color without needing real artwork.
function colorFromSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 32%, 82%)`;
}

export default function ItemCard({
  id,
  title,
  type,
  tags,
}: {
  id: string;
  title: string;
  type: "BOOK" | "SHOW";
  tags: string[];
}) {
  const isBook = type === "BOOK";
  const bg = colorFromSeed(title);

  return (
    <Link
      href={`/item/${id}`}
      className={`shelf-card shrink-0 w-40 bg-white ${isBook ? "spine" : "poster"} shadow-sm block overflow-hidden`}
    >
      <div
        className="h-48 flex items-end p-3"
        style={{ backgroundColor: bg }}
      >
        <span className="font-display text-sm leading-tight text-ink">
          {title}
        </span>
      </div>
      <div className="p-2 flex flex-wrap gap-1">
        {tags.slice(0, 2).map((t) => (
          <span key={t} className="tag-stamp">
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}
