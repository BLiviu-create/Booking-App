import { useState } from "react";
import { useRouter } from "next/navigation";
import { userUpdateSchema } from "@/lib/validation";

export default function ClientAccountUpdate({ user }: { user: { id: string; name: string; email: string; role: string } }) {
  const router = useRouter();
  const [form, setForm] = useState({
    id: user.id,
    name: user.name,
    email: user.email,
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError(null);
    setSuccess(false);
    const result = userUpdateSchema.safeParse(form);
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
      const res = await fetch("/api/client/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.error === "validation_error") {
          const errors: { name?: string; email?: string; password?: string } = {};
          data.details.forEach((issue: any) => {
            const key = issue.path[0] as keyof typeof errors;
            if (key) errors[key] = issue.message;
          });
          setFieldErrors(errors);
        } else {
          setSubmitError("Update failed");
        }
        setSuccess(false);
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setSubmitError("Update failed");
    }
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-3 max-w-md mx-auto p-4 border rounded">
      <h2 className="text-lg font-bold mb-2">Update Account</h2>
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
          placeholder="New Password (optional)"
          className="border px-2 py-1 rounded w-full"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        />
        {fieldErrors.password && <div className="text-xs text-red-600">{fieldErrors.password}</div>}
      </div>
      {submitError && <div className="text-xs text-red-600">{submitError}</div>}
      {success && <div className="text-xs text-green-600">Account updated successfully!</div>}
  <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded w-full">Update</button>
    </form>
  );
}
