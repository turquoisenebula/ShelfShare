"use client";

import { useState } from "react";
import Link from "next/link";

type PersonResult = {
  id: string;
  name: string;
  username: string;
  following: boolean;
};

export default function PeopleSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PersonResult[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function search(q: string) {
    setQuery(q);
    if (!q.trim()) return setResults([]);
    const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
    setResults(await res.json());
  }

  async function toggleFollow(username: string) {
    setLoadingId(username);
    const res = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const d = await res.json();
    setResults((prev) =>
      prev.map((p) => (p.username === username ? { ...p, following: !!d.following } : p))
    );
    setLoadingId(null);
  }

  return (
    <div className="mb-12 bg-white border border-ink/10 rounded-spine p-5">
      <h2 className="font-display text-lg mb-3">Find people to follow</h2>
      <input
        placeholder="Search by name or username…"
        value={query}
        onChange={(e) => search(e.target.value)}
        className="w-full border border-ink/20 rounded-spine px-4 py-2 mb-2"
      />

      {query && results.length === 0 && (
        <p className="text-sm text-ink/50">No one matches "{query}".</p>
      )}

      {results.length > 0 && (
        <ul className="divide-y divide-ink/10 border border-ink/10 rounded-spine">
          {results.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <Link href={`/u/${p.username}`} className="hover:text-rust transition-colors">
                {p.name} <span className="text-ink/40">@{p.username}</span>
              </Link>
              <button
                onClick={() => toggleFollow(p.username)}
                disabled={loadingId === p.username}
                className={`px-3 py-1 rounded-spine text-xs transition-colors ${
                  p.following
                    ? "border border-ink/20 hover:border-rust hover:text-rust"
                    : "bg-rust text-paper hover:bg-ink"
                }`}
              >
                {p.following ? "Following" : "Follow"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
