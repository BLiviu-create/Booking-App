import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const data = await request.json();
  // Accept both string and number for userId/roomId
  const payload = {
    ...data,
    userId: typeof data.userId === "string" ? Number(data.userId) : data.userId,
    roomId: typeof data.roomId === "string" ? Number(data.roomId) : data.roomId,
  };
  const result = bookingSchema.safeParse({
    ...payload,
    userId: String(payload.userId),
    roomId: String(payload.roomId),
  });
  if (!result.success) {
    return NextResponse.json({ error: "validation_error", details: result.error.issues }, { status: 400 });
  }
  // Check for overlap
  const overlaps = await prisma.booking.findFirst({
    where: {
      roomId: payload.roomId,
      NOT: [
        { endDate: { lte: new Date(payload.startDate) } },
        { startDate: { gte: new Date(payload.endDate) } },
      ],
    },
  });
  if (overlaps) {
    return NextResponse.json({ error: "room_booked" }, { status: 409 });
  }
  // Create booking
  const booking = await prisma.booking.create({
    data: {
      userId: payload.userId,
      roomId: payload.roomId,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
    },
    include: { room: true },
  });
  return NextResponse.json({ booking });
}
