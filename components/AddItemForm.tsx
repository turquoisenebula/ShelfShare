"use client";

import { useState } from "react";

type SearchResult = {
  id: string;
  title: string;
  type: "BOOK" | "SHOW";
};

export default function AddItemForm({ onAdded }: { onAdded: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"BOOK" | "SHOW">("BOOK");
  const [newDesc, setNewDesc] = useState("");
  const [newTags, setNewTags] = useState("");

  async function search(q: string) {
    setQuery(q);
    if (!q) return setResults([]);
    const res = await fetch(`/api/items?q=${encodeURIComponent(q)}`);
    setResults(await res.json());
  }

  async function addToList(itemId: string, status: string) {
    await fetch("/api/user-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, status }),
    });
    setQuery("");
    setResults([]);
    onAdded();
  }

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        type: newType,
        description: newDesc,
        tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    const item = await res.json();
    await addToList(item.id, "WANT");
    setCreating(false);
    setNewTitle("");
    setNewDesc("");
    setNewTags("");
  }

  return (
    <div className="mb-10 bg-white border border-ink/10 rounded-spine p-5">
      <h2 className="font-display text-lg mb-3">Add something to your shelf</h2>
      <input
        placeholder="Search titles…"
        value={query}
        onChange={(e) => search(e.target.value)}
        className="w-full border border-ink/20 rounded-spine px-4 py-2 mb-2"
      />

      {results.length > 0 && (
        <ul className="mb-3 divide-y divide-ink/10 border border-ink/10 rounded-spine">
          {results.map((r) => (
            <li key={r.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span>
                {r.title} <span className="text-ink/40">· {r.type === "BOOK" ? "Book" : "Show"}</span>
              </span>
              <button
                onClick={() => addToList(r.id, "WANT")}
                className="text-rust hover:underline"
              >
                Add to Want to
              </button>
            </li>
          ))}
        </ul>
      )}

      {!creating ? (
        <button
          onClick={() => setCreating(true)}
          className="text-sm text-ink/60 hover:text-rust"
        >
          Can't find it? Add a new title →
        </button>
      ) : (
        <form onSubmit={createItem} className="space-y-2 mt-2">
          <input
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full border border-ink/20 rounded-spine px-3 py-1.5 text-sm"
            required
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as "BOOK" | "SHOW")}
            className="w-full border border-ink/20 rounded-spine px-3 py-1.5 text-sm"
          >
            <option value="BOOK">Book</option>
            <option value="SHOW">Show</option>
          </select>
          <textarea
            placeholder="Short description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full border border-ink/20 rounded-spine px-3 py-1.5 text-sm"
            required
          />
          <input
            placeholder="Tags, comma separated (e.g. Sci-Fi, Slow Burn)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            className="w-full border border-ink/20 rounded-spine px-3 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-rust text-paper px-4 py-1.5 rounded-spine text-sm hover:bg-ink transition-colors"
            >
              Add to shelf
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="text-sm text-ink/50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
