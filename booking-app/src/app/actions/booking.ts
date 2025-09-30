"use server";
import { prisma } from "@/lib/prisma";
import { bookingSchema, bookingUpdateSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function createBooking(formData: FormData) {
  const rawData = {
    userId: String(formData.get("userId") || ""),
    roomId: String(formData.get("roomId") || ""),
    startDate: String(formData.get("startDate") || ""),
    endDate: String(formData.get("endDate") || ""),
  };

  try {
    const parsed = bookingSchema.parse(rawData);

    const start = new Date(parsed.startDate);
    const end = new Date(parsed.endDate);
    const now = new Date();

    // Validări suplimentare
    if (end <= start)
      return { success: false, errors: { endDate: "End date must be after start date" } };

    if (start < now)
      return { success: false, errors: { startDate: "Cannot create a booking in the past" } };

    // Verificare suprapunere rezervări
    const overlapping = await prisma.booking.findFirst({
      where: {
        roomId: Number(parsed.roomId),
        AND: [
          { startDate: { lt: end } },
          { endDate: { gt: start } },
        ],
      },
    });
    if (overlapping)
      return { success: false, errors: { general: "Room is already booked in this interval" } };

    const booking = await prisma.booking.create({
      data: {
        userId: Number(parsed.userId),
        roomId: Number(parsed.roomId),
        startDate: start,
        endDate: end,
      },
    });

    return { success: true, booking, message: "Booking created successfully!" };
  } catch (err) {
    if (err instanceof ZodError) {
      const errors: Record<string, string> = {};
      err.errors.forEach(e => {
        if (e.path.length > 0) errors[e.path[0]] = e.message;
      });
      return { success: false, errors };
    }
    throw err;
  }
}
// ✅ Păstrăm funcțiile existente
export async function updateBooking(formData: FormData) {
  const rawData = {
    id: String(formData.get("id") || ""),
    userId: String(formData.get("userId") || ""),
    roomId: String(formData.get("roomId") || ""),
    startDate: String(formData.get("startDate") || ""),
    endDate: String(formData.get("endDate") || ""),
  };

  try {
    const parsed = bookingUpdateSchema.parse(rawData);

    const start = new Date(parsed.startDate);
    const end = new Date(parsed.endDate);
    if (end <= start) return { success: false, errors: { endDate: "End date must be after start date" } };

    // Check overlapping bookings excluding current booking
    const overlapping = await prisma.booking.findFirst({
      where: {
        roomId: Number(parsed.roomId),
        id: { not: Number(parsed.id) },
        AND: [
          { startDate: { lt: end } },
          { endDate: { gt: start } },
        ],
      },
    });
    if (overlapping) return { success: false, errors: { general: "Room is already booked in this interval" } };

    const booking = await prisma.booking.update({
      where: { id: Number(parsed.id) },
      data: {
        userId: Number(parsed.userId),
        roomId: Number(parsed.roomId),
        startDate: start,
        endDate: end,
      },
    });

    return { success: true, booking };
  } catch (err) {
    if (err instanceof ZodError) {
      const errors: Record<string, string> = {};
      err.errors.forEach(e => {
        if (e.path.length > 0) errors[e.path[0]] = e.message;
      });
      return { success: false, errors };
    }
    throw err;
  }
}

export async function deleteBooking(formData: FormData) {
  const id = Number(formData.get("id"));
  await prisma.booking.delete({ where: { id } });
}

export async function listBookings() {
  return await prisma.booking.findMany({
    include: { user: true, room: true },
    orderBy: { id: "desc" },
  });
}