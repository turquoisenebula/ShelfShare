"use client";

export default function TagFilter({
  allTags,
  activeTags,
  onToggle,
  onClear,
}: {
  allTags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}) {
  if (allTags.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink/50 mr-1">Filter by tag:</span>
        {allTags.map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onToggle(tag)}
              className={`tag-stamp transition-colors ${
                active ? "bg-rust text-paper border-rust" : "hover:border-rust"
              }`}
            >
              {tag}
            </button>
          );
        })}
        {activeTags.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-ink/50 hover:text-rust ml-1"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
