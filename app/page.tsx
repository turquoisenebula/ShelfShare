import Link from "next/link";

export default function Home() {
  return (
    <div className="pt-20 pb-32">
      <p className="tag-stamp mb-6">A shelf, shared</p>
      <h1 className="font-display text-5xl md:text-6xl leading-[1.05] max-w-2xl mb-6">
        Track what you're reading and watching — and find what's next.
      </h1>
      <p className="text-ink/70 max-w-md mb-8 leading-relaxed">
        Keep a shelf of books and shows across want-to, in-progress, and
        done. Rate what you finish, and ShelfShare quietly notices what you
        tend to like — then tells you why.
      </p>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="bg-rust text-paper px-6 py-3 rounded-spine hover:bg-ink transition-colors"
        >
          Start your shelf
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 border border-ink/20 rounded-spine hover:border-ink transition-colors"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
