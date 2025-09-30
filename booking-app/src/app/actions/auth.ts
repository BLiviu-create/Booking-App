"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;
  if (!uid) return null;
  const userId = Number(uid);
  if (Number.isNaN(userId)) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    redirect("/?error=missing_credentials");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    redirect("/?error=invalid_credentials");
  }

  const cookieStore = await cookies();
  cookieStore.set("uid", String(user.id), { httpOnly: true, sameSite: "lax" });
  cookieStore.set("role", user.role, { httpOnly: true, sameSite: "lax" });

  if (user.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/client");
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("uid");
  cookieStore.delete("role");
  redirect("/");
}

export async function loginNoRedirect(formData: FormData): Promise<{ role: "admin" | "client" }> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    throw new Error("invalid_credentials");
  }

  const cookieStore = await cookies();
  cookieStore.set("uid", String(user.id), { httpOnly: true, sameSite: "lax" });
  cookieStore.set("role", user.role, { httpOnly: true, sameSite: "lax" });

  const role = user.role === "admin" ? "admin" : "client";
  return { role };
}
