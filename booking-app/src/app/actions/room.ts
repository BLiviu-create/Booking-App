"use server";
import { prisma } from "@/lib/prisma";
import { roomSchema, roomUpdateSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function createRoom(formData: FormData) {
  const rawData = {
    number: String(formData.get("number") || "").trim(),
    type: String(formData.get("type") || "").trim(),
    capacity: Number(formData.get("capacity")),
  };

  try {
    const parsed = roomSchema.parse(rawData);
    const room = await prisma.room.create({ data: parsed });
    return { success: true, room };
  } catch (err) {
    if (err instanceof ZodError) {
      const errors: Record<string, string> = {};
      err.issues.forEach(e => {
        if (e.path.length > 0) errors[String(e.path[0])] = e.message;
      });
      return { success: false, errors };
    }
    throw err;
  }
}

export async function updateRoom(formData: FormData) {
  const rawData = {
    id: String(formData.get("id") || ""),
    number: String(formData.get("number") || "").trim(),
    type: String(formData.get("type") || "").trim(),
    capacity: Number(formData.get("capacity")),
  };

  try {
    const parsed = roomUpdateSchema.parse(rawData);
    const room = await prisma.room.update({
      where: { id: Number(parsed.id) },
      data: {
        number: parsed.number,
        type: parsed.type,
        capacity: parsed.capacity,
      },
    });
    return { success: true, room };
  } catch (err) {
    if (err instanceof ZodError) {
      const errors: Record<string, string> = {};
      err.issues.forEach(e => {
        if (e.path.length > 0) errors[String(e.path[0])] = e.message;
      });
      return { success: false, errors };
    }
    throw err;
  }
}

export async function deleteRoom(formData: FormData) {
  const id = Number(formData.get("id"));
  await prisma.room.delete({ where: { id } });
}

export async function listRooms() {
  return await prisma.room.findMany({ orderBy: { number: "asc" } });
}
