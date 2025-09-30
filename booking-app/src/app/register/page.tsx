"use client";
import { useState } from "react";
import { userSchema } from "@/lib/validation";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function registerAction(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError(null);
    setSuccess(false);
  const result = userSchema.safeParse(form);
    if (!result.success) {
      const errors: { name?: string; email?: string; password?: string } = {};
      result.error.issues.forEach((issue: unknown) => {
        if (
          typeof issue === "object" &&
          issue !== null &&
          "path" in issue &&
          Array.isArray((issue as { path: unknown }).path)
        ) {
          const key = (issue as { path: unknown[] }).path[0] as keyof typeof errors;
          if (key && "message" in issue) errors[key] = (issue as { message: string }).message;
        }
      });
      setFieldErrors(errors);
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!data.success) {
        // Map API errors to field errors if possible
        const errors: { name?: string; email?: string; password?: string } = {};
        if (Array.isArray(data.errors)) {
          data.errors.forEach((issue: any) => {
            if (issue.path && issue.path[0] && issue.message) {
              const key = issue.path[0] as keyof typeof errors;
              errors[key] = issue.message;
            }
          });
        }
        setFieldErrors(errors);
        setSubmitError("Registration failed");
        return;
      }
      setSuccess(true);
  setForm({ name: "", email: "", password: "", role: "client" });
    } catch {
      setSubmitError("Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm border rounded p-6">
        <h1 className="text-xl font-bold mb-4">Create account</h1>
        <form onSubmit={registerAction} className="space-y-3">
          <div>
            <input
              name="name"
              placeholder="Name"
              className="border px-2 py-1 rounded w-full"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            {fieldErrors.name && <div className="text-xs text-red-600">{fieldErrors.name}</div>}
          </div>
          <div>
            <select
              name="role"
              className="border px-2 py-1 rounded w-full"
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <input
              name="email"
              placeholder="Email"
              className="border px-2 py-1 rounded w-full"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            {fieldErrors.email && <div className="text-xs text-red-600">{fieldErrors.email}</div>}
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="border px-2 py-1 rounded w-full"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
            {fieldErrors.password && <div className="text-xs text-red-600">{fieldErrors.password}</div>}
          </div>
          {submitError && <div className="text-xs text-red-600">{submitError}</div>}
          {success && <div className="text-xs text-green-600">Account created successfully!</div>}
          <button className="bg-blue-600 text-white px-3 py-1 rounded w-full">Create</button>
        </form>
      </div>
    </div>
  );
}



