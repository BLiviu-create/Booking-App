import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const roomId = Number(params.id); // ✅ direct, fără await

  if (!roomId) {
    return NextResponse.json({ error: "invalid_room" }, { status: 400 });
  }

  const u = new URL(request.url);
  const year = Number(u.searchParams.get("year") ?? new Date().getFullYear());
  const month = Number(u.searchParams.get("month") ?? new Date().getMonth()); // 0-based

  const monthStart = new Date(year, month, 1, 0, 0, 0, 0);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      roomId,
      AND: [
        { startDate: { lte: monthEnd } },
        { endDate: { gte: monthStart } },
      ],
    },
    orderBy: { startDate: "asc" },
    select: { id: true, startDate: true, endDate: true },
  });

  return NextResponse.json({
    room: {
      id: room.id,
      number: room.number,
      type: room.type,
      capacity: room.capacity,
    },
    bookings,
    year,
    month,
  });
}