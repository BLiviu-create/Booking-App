"use client";

import { useState, useTransition } from "react";
import { loginSchema } from "@/lib/validation";
import Link from "next/link";
import { loginNoRedirect } from "@/app/actions/auth";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isPending, startTransition] = useTransition();
  const [isValid, setIsValid] = useState(false);

  // Validate on every change
  function validate(email: string, password: string) {
    const result = loginSchema.safeParse({ email, password });
    setIsValid(result.success);
    if (!result.success && (email || password)) {
      const errors: { email?: string; password?: string } = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0] === "email") errors.email = issue.message;
        if (issue.path[0] === "password") errors.password = issue.message;
      });
      setFieldErrors(errors);
      setError(null);
    } else {
      setFieldErrors({});
      setError(null);
    }
  }

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
      } catch {
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
        onChange={(e) => {
          setEmail(e.target.value);
          validate(e.target.value, password);
        }}
      />
      {fieldErrors.email && <div className="text-sm text-red-600">{fieldErrors.email}</div>}
      <input
        name="password"
        type="password"
        placeholder="Password"
        className="border px-2 py-1 rounded w-full"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          validate(email, e.target.value);
        }}
      />
      {fieldErrors.password && <div className="text-sm text-red-600">{fieldErrors.password}</div>}
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <button disabled={isPending || !isValid} className="bg-blue-600 text-white px-3 py-1 rounded w-full">
        {isPending ? "Signing in..." : "Sign in"}
      </button>
      <Link href="/register" className="block text-center border px-3 py-1 rounded w-full hover:bg-gray-50">
        Create account
      </Link>
    </form>
  );
}


