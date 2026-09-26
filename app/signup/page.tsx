"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    router.push("/shelf");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto pt-16">
      <h1 className="font-display text-3xl mb-6">Start your shelf</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {(["name", "username", "email", "password"] as const).map((field) => (
          <input
            key={field}
            type={field === "password" ? "password" : field === "email" ? "email" : "text"}
            placeholder={field[0].toUpperCase() + field.slice(1)}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full border border-ink/20 rounded-spine px-4 py-2 bg-white"
            required
          />
        ))}
        {error && <p className="text-sm text-rust">{error}</p>}
        <button
          type="submit"
          className="w-full bg-rust text-paper py-2 rounded-spine hover:bg-ink transition-colors"
        >
          Create account
        </button>
      </form>
    </div>
  );
}
