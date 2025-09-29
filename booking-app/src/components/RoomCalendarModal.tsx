"use client";

import { useEffect, useMemo, useState } from "react";

type BookingDTO = { id: number; startDate: string; endDate: string };

export default function RoomCalendarModal({
  roomId,
  open,
  onClose,
}: {
  roomId: number;
  open: boolean;
  onClose: () => void;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [room, setRoom] = useState<{
    id: number;
    number: string;
    type: string;
    capacity: number;
  } | null>(null);
  const [bookings, setBookings] = useState<BookingDTO[]>([]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(
          `/api/rooms/${roomId}/calendar?year=${year}&month=${month}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        setRoom(data.room);
        setBookings(data.bookings);
      } catch (err: any) {
        const isAbort =
          err?.name === "AbortError" ||
          err?.message === "modal_closed" ||
          String(err) === "modal_closed";
        if (!isAbort) console.error(err);
      }
    })();
    return () => controller.abort("modal_closed");
  }, [roomId, year, month, open]);

  const cells = useMemo(() => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
    const firstWeekday = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();

    function dayBooked(day: Date) {
      const dayStartUtcMs = Date.UTC(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        0,
        0,
        0,
        0
      );
      const dayEndUtcMs = Date.UTC(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        23,
        59,
        59,
        999
      );
      return bookings.some((b) => {
        const startMs = new Date(b.startDate).getTime();
        const endMs = new Date(b.endDate).getTime();
        return startMs <= dayEndUtcMs && endMs >= dayStartUtcMs;
      });
    }

    const list: Array<{ date: Date | null; booked: boolean }> = [];
    for (let i = 0; i < firstWeekday; i++)
      list.push({ date: null, booked: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      list.push({ date, booked: dayBooked(date) });
    }
    return list;
  }, [year, month, bookings]);

  const monthLabel = new Date(year, month, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-x-0 top-5 mx-auto max-w-2xl rounded-lg border bg-white shadow-lg">
        <div className="flex items-center justify-between px-3 py-2 border-b text-sm">
          <div className="font-semibold">
            {room ? `Room ${room.number} calendar` : "Calendar"}
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
          >
            Close
          </button>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
              onClick={() =>
                setMonth((m) =>
                  m === 0 ? (setYear((y) => y - 1), 11) : m - 1
                )
              }
            >
              Prev
            </button>
            <div className="text-sm text-gray-700 w-32 text-center">
              {monthLabel}
            </div>
            <button
              className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
              onClick={() =>
                setMonth((m) =>
                  m === 11 ? (setYear((y) => y + 1), 0) : m + 1
                )
              }
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[11px] font-medium text-gray-600 mb-1">
            {weekDays.map((d) => (
              <div key={d} className="text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => (
              <div
                key={idx}
                className={`h-12 rounded border flex items-start justify-start p-1 ${
                  cell.date
                    ? cell.booked
                      ? "bg-red-100 border-red-200"
                      : "bg-green-100 border-green-200"
                    : "bg-transparent border-transparent"
                }`}
              >
                {cell.date ? (
                  <span className="text-[10px] font-semibold text-gray-800">
                    {cell.date.getDate()}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-600">
            <div className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded bg-green-200 border border-green-300" />{" "}
              Available
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded bg-red-200 border border-red-300" />{" "}
              Booked
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}