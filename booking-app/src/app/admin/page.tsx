"use client"; // folosim client pentru state și formulare interactive
import { useState, useEffect } from "react";
import * as userActions from "@/app/actions/user";
import * as roomActions from "@/app/actions/room";
import * as bookingActions from "@/app/actions/booking";
import ClientRoomsCalendar from "@/components/ClientRoomsCalendar";

export default function AdminPage() {
  // Field errors for Create Room and Booking forms
  const [roomFieldErrors, setRoomFieldErrors] = useState<{ number?: string; type?: string; capacity?: string }>({});
  const [bookingFieldErrors, setBookingFieldErrors] = useState<{ userId?: string; roomId?: string; startDate?: string; endDate?: string }>({});
  // Import schemas
  const { roomSchema, bookingSchema } = require("@/lib/validation");
  // Field errors for Create User form
  const [userFieldErrors, setUserFieldErrors] = useState<{ name?: string; email?: string; password?: string; role?: string }>({});
  // Import userSchema
  const { userSchema } = require("@/lib/validation");
  // State pentru datele din dashboard
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [errorBooking, setErrorBooking] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<string | null>(null);

  // Fetch inițial date
  useEffect(() => {
    const fetchData = async () => {
      setUsers(await userActions.listUsers());
      setRooms(await roomActions.listRooms());
      setBookings(await bookingActions.listBookings());
    };
    fetchData();
  }, []);

  const refreshBookings = async () => {
    setBookings(await bookingActions.listBookings());
  };

  const handleCreateBooking = async (formData: FormData) => {
    setErrorBooking(null);
    setSuccessBooking(null);

    const result = await bookingActions.createBooking(formData);

    if (result.success) {
      setSuccessBooking(result.message || "Booking created successfully!");
      setErrorBooking(null);
      refreshBookings();
    } else {
      // Arată primul mesaj de eroare disponibil
      const firstError = result.errors?.startDate || result.errors?.endDate || result.errors?.general || "Failed to create booking";
      setErrorBooking(firstError);
      setSuccessBooking(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/60 border-b border-black/5">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-500 to-sky-500" />
            <span className="font-semibold tracking-tight">Admin dashboard</span>
          </div>
          <div className="text-sm text-gray-600">Manage users, rooms, and bookings</div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        <h1 className="text-2xl font-bold">Overview</h1>

        {/* Users Section */}
        <section className="p-6 border rounded-xl bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Create User</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setUserFieldErrors({});
              const formData = new FormData(e.currentTarget);
              const rawData = {
                name: String(formData.get("name") || "").trim(),
                email: String(formData.get("email") || "").trim(),
                password: String(formData.get("password") || "").trim(),
                role: String(formData.get("role") || "").trim(),
              };
              const result = userSchema.safeParse(rawData);
              if (!result.success) {
                const errors: { name?: string; email?: string; password?: string; role?: string } = {};
                result.error.issues.forEach((issue: any) => {
                  const key = issue.path[0] as keyof typeof errors;
                  if (key) errors[key] = issue.message;
                });
                setUserFieldErrors(errors);
                return;
              }
              await userActions.createUser(formData);
              setUsers(await userActions.listUsers());
              if (e.currentTarget && typeof e.currentTarget.reset === 'function') {
                e.currentTarget.reset();
              }
            }}
            className="flex gap-2 flex-wrap"
          >
            <div>
              <input name="name" placeholder="Name" className="border px-2 py-1 rounded w-32" />
              {userFieldErrors.name && <div className="text-xs text-red-600">{userFieldErrors.name}</div>}
            </div>
            <div>
              <input name="email" placeholder="Email" className="border px-2 py-1 rounded w-40" />
              {userFieldErrors.email && <div className="text-xs text-red-600">{userFieldErrors.email}</div>}
            </div>
            <div>
              <input name="password" type="password" placeholder="Password" className="border px-2 py-1 rounded w-32" />
              {userFieldErrors.password && <div className="text-xs text-red-600">{userFieldErrors.password}</div>}
            </div>
            <div>
              <select name="role" className="border px-2 py-1 rounded w-24">
                <option value="client">client</option>
                <option value="admin">admin</option>
              </select>
              {userFieldErrors.role && <div className="text-xs text-red-600">{userFieldErrors.role}</div>}
            </div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded">Create</button>
          </form>

          <h3 className="font-semibold mt-6">Users</h3>
          <ul className="space-y-2">
            {users.map(u => (
              <li key={u.id} className="flex justify-between items-center border p-2 rounded bg-gray-50 gap-2">
                <form
                  action={async (formData: FormData) => {
                    await userActions.updateUser(formData);
                    setUsers(await userActions.listUsers());
                  }}
                  className="flex gap-2 items-center"
                >
                  <input type="hidden" name="id" value={u.id} />
                  <input name="name" defaultValue={u.name} className="border px-2 py-1 rounded w-24" />
                  <input name="email" defaultValue={u.email} className="border px-2 py-1 rounded w-32" />
                  <select name="role" defaultValue={u.role} className="border px-2 py-1 rounded w-20">
                    <option value="client">client</option>
                    <option value="admin">admin</option>
                  </select>
                  <button className="bg-green-500 text-white px-2 py-1 rounded text-xs">Update</button>
                </form>
                <form
                  action={async (formData: FormData) => {
                    await userActions.deleteUser(formData);
                    setUsers(await userActions.listUsers());
                  }}
                >
                  <input type="hidden" name="id" value={u.id} />
                  <button className="bg-red-500 text-white px-2 py-1 rounded text-xs">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        </section>

        {/* Rooms Section */}
        <section className="p-6 border rounded-xl bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Create Room</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setRoomFieldErrors({});
              const formData = new FormData(e.currentTarget);
              const rawData = {
                number: String(formData.get("number") || "").trim(),
                type: String(formData.get("type") || "").trim(),
                capacity: Number(formData.get("capacity")),
              };
              const result = roomSchema.safeParse(rawData);
              if (!result.success) {
                const errors: { number?: string; type?: string; capacity?: string } = {};
                result.error.issues.forEach((issue: any) => {
                  if (issue.path && issue.path.length > 0) {
                    const key = String(issue.path[0]);
                    if (key === 'type' || key === 'number' || key === 'capacity') {
                      errors[key] = issue.message;
                    }
                  }
                });
                setRoomFieldErrors(errors);
                return;
              }
              await roomActions.createRoom(formData);
              setRooms(await roomActions.listRooms());
              if (e.currentTarget && typeof e.currentTarget.reset === 'function') {
                e.currentTarget.reset();
              }
            }}
            className="flex gap-2 flex-wrap"
          >
            <div>
              <input name="number" placeholder="Room #" className="border px-2 py-1 rounded w-20" />
              {roomFieldErrors.number && <div className="text-xs text-red-600">{roomFieldErrors.number}</div>}
            </div>
            <div>
              <input name="type" placeholder="Type" className="border px-2 py-1 rounded w-24" />
              {roomFieldErrors.type && <div className="text-xs text-red-600">{roomFieldErrors.type}</div>}
            </div>
            <div>
              <input name="capacity" type="number" placeholder="Capacity" className="border px-2 py-1 rounded w-16" />
              {roomFieldErrors.capacity && <div className="text-xs text-red-600">{roomFieldErrors.capacity}</div>}
            </div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded">Create</button>
          </form>

          <h3 className="font-semibold mt-6">Rooms Calendar</h3>
          <ClientRoomsCalendar rooms={rooms} bookings={bookings} />

          <h3 className="font-semibold mt-6">Rooms</h3>
          <ul className="space-y-2">
            {rooms.map(r => (
              <li key={r.id} className="flex justify-between items-center border p-2 rounded bg-gray-50 gap-2">
                <form
                  action={async (formData: FormData) => {
                    await roomActions.updateRoom(formData);
                    setRooms(await roomActions.listRooms());
                  }}
                  className="flex gap-2 items-center"
                >
                  <input type="hidden" name="id" value={r.id} />
                  <input name="number" defaultValue={r.number} className="border px-2 py-1 rounded w-20" />
                  <input name="type" defaultValue={r.type} className="border px-2 py-1 rounded w-24" />
                  <input name="capacity" type="number" defaultValue={r.capacity} className="border px-2 py-1 rounded w-16" />
                  <button className="bg-green-500 text-white px-2 py-1 rounded text-xs">Update</button>
                </form>
                <form
                  action={async (formData: FormData) => {
                    await roomActions.deleteRoom(formData);
                    setRooms(await roomActions.listRooms());
                  }}
                >
                  <input type="hidden" name="id" value={r.id} />
                  <button className="bg-red-500 text-white px-2 py-1 rounded text-xs">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        </section>

        {/* Bookings Section */}
        <section className="p-6 border rounded-xl bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Create Booking</h2>

          <form
            onSubmit={async e => {
              e.preventDefault();
              setBookingFieldErrors({});
              const formData = new FormData(e.currentTarget);
              const rawData = {
                userId: String(formData.get("userId") || ""),
                roomId: String(formData.get("roomId") || ""),
                startDate: String(formData.get("startDate") || ""),
                endDate: String(formData.get("endDate") || ""),
              };
              const result = bookingSchema.safeParse(rawData);
              if (!result.success) {
                const errors: { userId?: string; roomId?: string; startDate?: string; endDate?: string } = {};
                result.error.issues.forEach((issue: any) => {
                  const key = issue.path[0] as keyof typeof errors;
                  if (key) errors[key] = issue.message;
                });
                setBookingFieldErrors(errors);
                return;
              }
              await handleCreateBooking(formData);
              e.currentTarget.reset();
            }}
            className="flex gap-2 flex-wrap"
          >
            <div>
              <select name="userId" className="border px-2 py-1 rounded w-24" required>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {bookingFieldErrors.userId && <div className="text-xs text-red-600">{bookingFieldErrors.userId}</div>}
            </div>
            <div>
              <select name="roomId" className="border px-2 py-1 rounded w-24" required>
                {rooms.map(r => <option key={r.id} value={r.id}>Room {r.number}</option>)}
              </select>
              {bookingFieldErrors.roomId && <div className="text-xs text-red-600">{bookingFieldErrors.roomId}</div>}
            </div>
            <div>
              <input type="datetime-local" name="startDate" className="border px-2 py-1 rounded w-36" required />
              {bookingFieldErrors.startDate && <div className="text-xs text-red-600">{bookingFieldErrors.startDate}</div>}
            </div>
            <div>
              <input type="datetime-local" name="endDate" className="border px-2 py-1 rounded w-36" required />
              {bookingFieldErrors.endDate && <div className="text-xs text-red-600">{bookingFieldErrors.endDate}</div>}
            </div>
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Create</button>
          </form>

          {/* Mesaje booking */}
          {errorBooking && <p className="mt-2 text-red-600">{errorBooking}</p>}
          {successBooking && <p className="mt-2 text-green-600">{successBooking}</p>}

          <h3 className="font-semibold mt-6">All Bookings</h3>
          <ul className="space-y-2">
            {bookings.map(b => (
              <li key={b.id} className="flex justify-between items-center border p-2 rounded bg-gray-50 gap-2">
                <form
                  action={async (formData: FormData) => {
                    await bookingActions.updateBooking(formData);
                    refreshBookings();
                  }}
                  className="flex gap-2 items-center"
                >
                  <input type="hidden" name="id" value={b.id} />
                  <select name="userId" defaultValue={b.user.id} className="border px-2 py-1 rounded w-24">
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <select name="roomId" defaultValue={b.room.id} className="border px-2 py-1 rounded w-24">
                    {rooms.map(r => <option key={r.id} value={r.id}>Room {r.number}</option>)}
                  </select>
                  <input type="datetime-local" name="startDate" defaultValue={new Date(b.startDate).toISOString().slice(0,16)} className="border px-2 py-1 rounded w-36" />
                  <input type="datetime-local" name="endDate" defaultValue={new Date(b.endDate).toISOString().slice(0,16)} className="border px-2 py-1 rounded w-36" />
                  <button className="bg-green-500 text-white px-2 py-1 rounded text-xs">Update</button>
                </form>

                <form
                  action={async (formData: FormData) => {
                    await bookingActions.deleteBooking(formData);
                    refreshBookings();
                  }}
                >
                  <input type="hidden" name="id" value={b.id} />
                  <button className="bg-red-500 text-white px-2 py-1 rounded text-xs">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
