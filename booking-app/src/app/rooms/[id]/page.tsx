import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function RoomCalendarPage({ params, searchParams }: { params: { id: string }, searchParams: { year?: string; month?: string } }) {
  const roomId = Number(params.id);
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return notFound();

  const now = new Date();
  const year = Number(searchParams?.year ?? now.getFullYear());
  const monthIndex = Number(searchParams?.month ?? now.getMonth()); // 0-based

  const monthStart = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999); // last day of month

  const bookings = await prisma.booking.findMany({
    where: {
      roomId,
      AND: [
        { startDate: { lte: monthEnd } },
        { endDate: { gte: monthStart } },
      ],
    },
    orderBy: { startDate: "asc" },
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function addDays(d: Date, days: number) {
    const nd = new Date(d);
    nd.setDate(nd.getDate() + days);
    return nd;
  }

  function isSameDate(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function isDayBooked(day: Date) {
    const dayStartUtcMs = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
    const dayEndUtcMs = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
    for (const b of bookings as any[]) {
      const startMs = new Date(b.startDate).getTime();
      const endMs = new Date(b.endDate).getTime();
      if (startMs <= dayEndUtcMs && endMs >= dayStartUtcMs) return true;
    }
    return false;
  }

  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = monthEnd.getDate();

  const cells: Array<{ date: Date | null; booked: boolean }> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ date: null, booked: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, monthIndex, d);
    cells.push({ date, booked: isDayBooked(date) });
  }

  const prev = new Date(year, monthIndex - 1, 1);
  const next = new Date(year, monthIndex + 1, 1);

  const monthLabel = monthStart.toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Room {room.number} calendar</h1>
          <div className="flex items-center gap-2">
            <a className="px-3 py-1 rounded border hover:bg-gray-50" href={`?year=${prev.getFullYear()}&month=${prev.getMonth()}`}>Prev</a>
            <div className="text-sm text-gray-700 w-40 text-center">{monthLabel}</div>
            <a className="px-3 py-1 rounded border hover:bg-gray-50" href={`?year=${next.getFullYear()}&month=${next.getMonth()}`}>Next</a>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-600 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((cell, idx) => (
              <div key={idx} className={`h-20 rounded border flex items-start justify-start p-2 ${cell.date ? (cell.booked ? "bg-red-100 border-red-200" : "bg-green-100 border-green-200") : "bg-transparent border-transparent"}`}>
                {cell.date ? (
                  <span className="text-xs font-semibold text-gray-800">{cell.date.getDate()}</span>
                ) : null}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-green-200 border border-green-300" /> Available</div>
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-red-200 border border-red-300" /> Booked</div>
          </div>
        </div>
      </div>
    </main>
  );
}


