import { useState } from "react";
import { userSchema } from "@/lib/validation";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function registerAction(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError(null);
    setSuccess(false);
    const result = userSchema.safeParse({ ...form, role: "client" });
    if (!result.success) {
      const errors: { name?: string; email?: string; password?: string } = {};
      result.error.issues.forEach((issue: any) => {
        const key = issue.path[0] as keyof typeof errors;
        if (key) errors[key] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }
    try {
      // You may want to call an API here instead of direct Prisma
      setSuccess(true);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
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



