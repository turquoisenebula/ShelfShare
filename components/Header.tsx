"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-ink/10">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl text-ink">
          ShelfShare
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {session ? (
            <>
              <Link href="/shelf" className="hover:text-rust transition-colors">
                My shelf
              </Link>
              <Link href="/feed" className="hover:text-rust transition-colors">
                Following
              </Link>
              <Link
                href={`/u/${(session.user as any).username}`}
                className="hover:text-rust transition-colors"
              >
                Public profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hover:text-rust transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-rust transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-rust text-paper px-4 py-1.5 rounded-spine hover:bg-ink transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
