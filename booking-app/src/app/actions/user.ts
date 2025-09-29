"use server";

import { prisma } from "@/lib/prisma";

// Create User
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: string
) {
  return await prisma.user.create({
    data: { name, email, password, role },
  });
}

// Read all users
export async function listUsers() {
  return await prisma.user.findMany({
    orderBy: { id: "asc" },
  });
}

// Read single user by ID
export async function getUserById(id: number) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

// Update User
export async function updateUser(
  id: number,
  data: { name?: string; email?: string; password?: string; role?: string }
) {
  return await prisma.user.update({
    where: { id },
    data,
  });
}

// Delete User
export async function deleteUser(id: number) {
  return await prisma.user.delete({
    where: { id },
  });
}