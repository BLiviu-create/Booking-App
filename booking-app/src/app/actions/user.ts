"use server";
import { prisma } from "@/lib/prisma";
import { userSchema, userUpdateSchema } from "@/lib/validation";

// Create User
export async function createUser(formData: FormData) {
  // Transformăm FormData în obiect simplu
  const rawData = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || "").trim(),
    role: String(formData.get("role") || "").trim(),
  };

  // Validare Zod
  const parsed = userSchema.parse(rawData); // aruncă eroare dacă nu validează

  // Creează user-ul în Prisma
  await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      password: parsed.password,
      role: parsed.role,
    },
  });
}

// Update User
export async function updateUser(formData: FormData) {
  // Transformăm FormData în obiect simplu
  const rawData = {
    id: String(formData.get("id") || ""),
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    role: String(formData.get("role") || "").trim(),
  };

  // Validare Zod
  const parsed = userUpdateSchema.parse(rawData);

  await prisma.user.update({
    where: { id: Number(parsed.id) },
    data: {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
    },
  });
}

// Delete User (safe)
export async function deleteUser(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.booking.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
}

// List all users
export async function listUsers() {
  return prisma.user.findMany({ orderBy: { id: "asc" } });
}