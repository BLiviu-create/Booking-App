"use client";

import { useEffect, useMemo, useState } from "react";

type BookingDTO = {
  id: number;
  startDate: string;
  endDate: string;
  room: { id: number; number: string; type: string };
};

export default function ClientCalendar({ bookings }: { bookings: BookingDTO[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const cells = useMemo(() => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
    const firstWeekday = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();

    function dayBooked(day: Date) {
      const dayStartMs = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEndMs = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);

      const booked = bookings.filter((b) => {
        const startMs = new Date(b.startDate).getTime();
        const endMs = new Date(b.endDate).getTime();
        return startMs <= dayEndMs && endMs >= dayStartMs;
      });

      return booked.length > 0 ? booked.map((b) => b.room) : [];
    }

    const list: Array<{ date: Date | null; rooms: BookingDTO["room"][] }> = [];
    for (let i = 0; i < firstWeekday; i++) list.push({ date: null, rooms: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      list.push({ date, rooms: dayBooked(date) });
    }
    return list;
  }, [year, month, bookings]);

  const monthLabel = new Date(year, month, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="p-2 border rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <button
          className="px-3 py-1 rounded border hover:bg-gray-50"
          onClick={() => setMonth((m) => (m === 0 ? (setYear((y) => y - 1), 11) : m - 1))}
        >
          Prev
        </button>
        <div className="text-sm text-gray-700 font-semibold">{monthLabel}</div>
        <button
          className="px-3 py-1 rounded border hover:bg-gray-50"
          onClick={() => setMonth((m) => (m === 11 ? (setYear((y) => y + 1), 0) : m + 1))}
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs font-medium text-gray-600 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs">
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className={`h-16 rounded border flex flex-col items-start p-1 overflow-hidden ${
              cell.date
                ? cell.rooms.length
                  ? "bg-red-100 border-red-200"
                  : "bg-green-100 border-green-200"
                : "bg-transparent border-transparent"
            }`}
          >
            {cell.date && <span className="font-semibold text-gray-800">{cell.date.getDate()}</span>}
            {cell.rooms.map((r) => (
              <span key={r.id} className="text-[10px] text-gray-700 truncate w-full">
                {r.number} ({r.type})
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-green-200 border border-green-300" /> Available
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-red-200 border border-red-300" /> Booked
        </div>
      </div>
    </div>
  );
}
