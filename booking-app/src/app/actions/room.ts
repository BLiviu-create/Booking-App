"use server";

import { prisma } from "@/lib/prisma";

export async function listRooms() {
  return prisma.room.findMany({ orderBy: { id: "asc" } });
}

export async function createRoom(data: { number: string; type: string; capacity: number }) {
  return prisma.room.create({ data });
}

export async function updateRoom(id: number, data: { number?: string; type?: string; capacity?: number }) {
  return prisma.room.update({ where: { id }, data });
}

export async function deleteRoom(id: number) {
  return prisma.room.delete({ where: { id } });
}

// (note) legacy duplicate createRoom removed