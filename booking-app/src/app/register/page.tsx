import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default function RegisterPage() {
  async function registerAction(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    if (!name || !email || !password) return;
    await prisma.user.create({ data: { name, email, password, role: "client" } });
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm border rounded p-6">
        <h1 className="text-xl font-bold mb-4">Create account</h1>
        <form action={registerAction} className="space-y-3">
          <input name="name" placeholder="Name" className="border px-2 py-1 rounded w-full" />
          <input name="email" placeholder="Email" className="border px-2 py-1 rounded w-full" />
          <input name="password" type="password" placeholder="Password" className="border px-2 py-1 rounded w-full" />
          <button className="bg-blue-600 text-white px-3 py-1 rounded w-full">Create</button>
        </form>
      </div>
    </div>
  );
}


