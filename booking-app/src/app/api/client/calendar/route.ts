import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = Number(url.searchParams.get("userId"));
  const year = Number(url.searchParams.get("year") ?? new Date().getFullYear());
  const month = Number(url.searchParams.get("month") ?? new Date().getMonth());

  if (!userId) return NextResponse.json({ error: "invalid_user" }, { status: 400 });

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      userId,
      AND: [
        { startDate: { lte: monthEnd } },
        { endDate: { gte: monthStart } },
      ],
    },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      room: { select: { id: true, number: true, type: true } },
    },
  });

  return NextResponse.json({ bookings, year, month });
}