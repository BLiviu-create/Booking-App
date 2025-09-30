"use client";
import ClientCalendar from "@/components/ClientCalendar";
import ClientAccountUpdate from "@/components/ClientAccountUpdate";
import { bookingSchema } from "@/lib/validation";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
export default function ClientPageClient({ me, myBookings, allBookings, rooms, uid }: any) {
  const [bookingForm, setBookingForm] = useState({ roomId: rooms[0]?.id || "", startDate: "", endDate: "" });
  const [bookingFieldErrors, setBookingFieldErrors] = useState<{ roomId?: string; startDate?: string; endDate?: string }>({});
  const [bookingSubmitError, setBookingSubmitError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const router = useRouter();

  function handleLogout() {
    document.cookie = "uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  }

  async function handleDeleteBooking(id: string) {
    setDeleteLoadingId(id);
    const res = await fetch(`/api/booking/delete?id=${id}`, { method: "DELETE" });
    setDeleteLoadingId(null);
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete booking.");
    }
  }

  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBookingFieldErrors({});
    setBookingSubmitError(null);
    setBookingSuccess(false);
    const result = bookingSchema.safeParse({
      userId: String(uid),
      roomId: String(bookingForm.roomId),
      startDate: bookingForm.startDate,
      endDate: bookingForm.endDate,
    });
    if (!result.success) {
      const errors: { roomId?: string; startDate?: string; endDate?: string } = {};
      result.error.issues.forEach((issue: any) => {
        const key = issue.path[0] as keyof typeof errors;
        if (key) errors[key] = issue.message;
      });
      setBookingFieldErrors(errors);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          roomId: bookingForm.roomId,
          startDate: bookingForm.startDate,
          endDate: bookingForm.endDate,
        }),
      });
      setLoading(false);
      if (!res.ok) {
        const data = await res.json();
        if (data.error === "room_booked") {
          setBookingSubmitError("This room is already booked for the selected period.");
        } else if (data.error === "validation_error") {
          const errors: { roomId?: string; startDate?: string; endDate?: string } = {};
          data.details.forEach((issue: any) => {
            const key = issue.path[0] as keyof typeof errors;
            if (key) errors[key] = issue.message;
          });
          setBookingFieldErrors(errors);
        } else {
          setBookingSubmitError("Booking failed. Please try again.");
        }
        setBookingSuccess(false);
        return;
      }
      setBookingSuccess(true);
      setBookingForm({ roomId: rooms[0]?.id || "", startDate: "", endDate: "" });
      router.refresh();
    } catch (err) {
      setBookingSubmitError("Booking failed. Please try again.");
      setBookingSuccess(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-black/5">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-500 to-sky-500" />
            <span className="font-semibold tracking-tight">Client dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {me.name}</span>
            <button
              className="px-3 py-1 bg-gray-200 rounded text-sm font-semibold hover:bg-gray-300"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* Personal account update removed as requested */}

        {/* Form pentru creare rezervare cu Zod validation */}
        <section className="p-6 border rounded-xl bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Create booking</h2>
          <form onSubmit={handleBookingSubmit} className="grid md:grid-cols-4 gap-2 items-end">
            <div>
              <select
                name="roomId"
                className="border px-2 py-1 rounded"
                value={bookingForm.roomId}
                onChange={e => setBookingForm(f => ({ ...f, roomId: e.target.value }))}
              >
                {rooms.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    Room {r.number} ({r.type})
                  </option>
                ))}
              </select>
              {bookingFieldErrors.roomId && <div className="text-xs text-red-600">{bookingFieldErrors.roomId}</div>}
            </div>
            <div>
              <input
                type="datetime-local"
                name="startDate"
                className="border px-2 py-1 rounded"
                value={bookingForm.startDate}
                onChange={e => setBookingForm(f => ({ ...f, startDate: e.target.value }))}
              />
              {bookingFieldErrors.startDate && <div className="text-xs text-red-600">{bookingFieldErrors.startDate}</div>}
            </div>
            <div>
              <input
                type="datetime-local"
                name="endDate"
                className="border px-2 py-1 rounded"
                value={bookingForm.endDate}
                onChange={e => setBookingForm(f => ({ ...f, endDate: e.target.value }))}
              />
              {bookingFieldErrors.endDate && <div className="text-xs text-red-600">{bookingFieldErrors.endDate}</div>}
            </div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded" disabled={loading}>{loading ? "Booking..." : "Book"}</button>
          </form>
          {bookingSubmitError && <div className="text-xs text-red-600 mt-2">{bookingSubmitError}</div>}
          {bookingSuccess && !bookingSubmitError && (
            <div className="text-xs text-green-600 mt-2">Booking created successfully!</div>
          )}
        </section>

        {/* Calendarul rezervărilor */}
        <section className="p-6 border rounded-xl bg-white shadow-sm">
          <h2 className="font-semibold mb-3">My bookings calendar</h2>
          <ClientCalendar bookings={myBookings.map((b: any) => ({
            id: b.id,
            room: { id: b.room.id, number: b.room.number, type: b.room.type },
            startDate: b.startDate.toISOString(),
            endDate: b.endDate.toISOString(),
          }))} />
        </section>

        {/* Lista rezervărilor */}
        <section className="p-6 border rounded-xl bg-white shadow-sm">
          <h2 className="font-semibold mb-3">My bookings</h2>
          <ul className="space-y-2">
            {myBookings.map((b: any) => (
              <li key={b.id} className="text-sm border rounded p-2 flex items-center justify-between">
                <span>
                  Room {b.room.number} ({b.room.type}) from {new Date(b.startDate).toLocaleString()} to {new Date(b.endDate).toLocaleString()}
                </span>
                <button
                  className="ml-4 px-2 py-1 bg-red-600 text-white rounded text-xs"
                  onClick={() => handleDeleteBooking(b.id)}
                  disabled={deleteLoadingId === b.id}
                >
                  {deleteLoadingId === b.id ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
