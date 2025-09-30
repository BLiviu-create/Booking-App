import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await context.params;
  const roomId = Number(resolvedParams.id);

  if (!roomId) {
    return NextResponse.json({ error: "invalid_room" }, { status: 400 });
  }

  const urlString = request.url || "";
  let u: URL;
  try {
    u = new URL(urlString);
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }
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