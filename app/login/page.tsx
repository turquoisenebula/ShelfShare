"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("That email or password doesn't match our records.");
    } else {
      router.push("/shelf");
      router.refresh();
    }
  }

  return (
    <div className="max-w-sm mx-auto pt-16">
      <h1 className="font-display text-3xl mb-6">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-ink/20 rounded-spine px-4 py-2 bg-white"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-ink/20 rounded-spine px-4 py-2 bg-white"
          required
        />
        {error && <p className="text-sm text-rust">{error}</p>}
        <button
          type="submit"
          className="w-full bg-rust text-paper py-2 rounded-spine hover:bg-ink transition-colors"
        >
          Log in
        </button>
      </form>
      <p className="text-sm text-ink/60 mt-4">
        Try the demo account: amara@example.com / password123
      </p>
    </div>
  );
}
