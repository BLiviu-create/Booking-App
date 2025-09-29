"use client";

import { useState } from "react";
import RoomCalendarModal from "@/components/RoomCalendarModal";

export default function ClientRoomsCalendar({ rooms, bookings }: { rooms: any[]; bookings: any[] }) {
  const [openRoomId, setOpenRoomId] = useState<number | null>(null);

  return (
    <div>
      <ul className="mt-2 space-y-3">
        {rooms.map((r) => {
          const rBookings = bookings.filter((b: any) => b.room.id === r.id);
          return (
            <li key={r.id} className="border rounded-xl bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="font-medium">Room {r.number} · {r.type} · cap {r.capacity}</div>
                <button className="text-sm text-blue-600 hover:underline" onClick={() => setOpenRoomId(r.id)}>Open calendar</button>
              </div>
              {rBookings.length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">No bookings yet.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {rBookings.slice(0, 5).map((b: any) => (
                    <li key={b.id} className="text-xs text-gray-700">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 align-middle mr-2" />
                      {new Date(b.startDate).toLocaleString()} → {new Date(b.endDate).toLocaleString()} · {b.user.name}
                    </li>
                  ))}
                  {rBookings.length > 5 ? (
                    <li className="text-xs text-gray-500">and {rBookings.length - 5} more…</li>
                  ) : null}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <RoomCalendarModal roomId={openRoomId || 0} open={openRoomId !== null} onClose={() => setOpenRoomId(null)} />
    </div>
  );
}


