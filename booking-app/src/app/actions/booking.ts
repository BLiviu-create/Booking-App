import { prisma } from "@/lib/prisma";

export async function listBookings() {
  return prisma.booking.findMany({ include: { user: true, room: true }, orderBy: { id: "desc" } });
}

export async function createBooking(userId: number, roomId: number, startDate: Date, endDate: Date) {
  await assertNoOverlap(roomId, startDate, endDate);
  return prisma.booking.create({ data: { userId, roomId, startDate, endDate } });
}

export async function updateBooking(id: number, data: { roomId?: number; startDate?: Date; endDate?: Date }) {
  if (data.roomId || data.startDate || data.endDate) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new Error("Booking not found");
    const roomId = data.roomId ?? booking.roomId;
    const start = data.startDate ?? booking.startDate;
    const end = data.endDate ?? booking.endDate;
    await assertNoOverlap(roomId, start, end, id);
  }
  return prisma.booking.update({ where: { id }, data });
}

export async function deleteBooking(id: number) {
  return prisma.booking.delete({ where: { id } });
}

async function assertNoOverlap(roomId: number, startDate: Date, endDate: Date, excludeId?: number) {
  const overlap = await prisma.booking.findFirst({
    where: {
      roomId,
      id: excludeId ? { not: excludeId } : undefined,
      OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
    },
  });
  if (overlap) throw new Error("Room already booked for selected interval");
}