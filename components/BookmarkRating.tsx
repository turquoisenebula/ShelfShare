"use client";

// A 5-unit rating rendered as small bookmark shapes instead of default stars.
export default function BookmarkRating({
  value,
  onChange,
}: {
  value: number | null;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value !== null && n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(n)}
            aria-label={`Rate ${n} of 5`}
            className={onChange ? "cursor-pointer" : "cursor-default"}
          >
            <svg
              className="bookmark-icon"
              viewBox="0 0 16 20"
              fill={filled ? "#B5502F" : "none"}
              stroke={filled ? "#B5502F" : "#1E1B16"}
              strokeWidth="1.4"
            >
              <path d="M1 1h14v17l-7-4.5L1 18V1z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
