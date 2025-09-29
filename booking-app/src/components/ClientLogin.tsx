"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { loginNoRedirect } from "@/app/actions/auth";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    startTransition(async () => {
      try {
        const { role } = await loginNoRedirect(formData);
        const url = role === "admin" ? "/admin" : "/client";
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (err) {
        setError("Invalid credentials");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        name="email"
        placeholder="Email"
        className="border px-2 py-1 rounded w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        className="border px-2 py-1 rounded w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <button disabled={isPending} className="bg-blue-600 text-white px-3 py-1 rounded w-full">
        {isPending ? "Signing in..." : "Sign in"}
      </button>
      <Link href="/register" className="block text-center border px-3 py-1 rounded w-full hover:bg-gray-50">
        Create account
      </Link>
    </form>
  );
}


