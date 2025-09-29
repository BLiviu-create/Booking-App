import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listUsers, createUser, updateUser, deleteUser } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { listRooms, createRoom, updateRoom as updateRoomAction, deleteRoom as deleteRoomAction } from "@/app/actions/room";
import ClientRoomsCalendar from "@/components/ClientRoomsCalendar";
import { listBookings, createBooking as createBookingAction, updateBooking as updateBookingAction, deleteBooking as deleteBookingAction } from "@/app/actions/booking";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const uid = cookieStore.get("uid")?.value;
  if (!uid || role !== "admin") redirect("/");

  const users = (await listUsers()) as any[];
  const rooms = (await listRooms()) as any[];
  const bookings = (await listBookings()) as any[];

  async function createUserAction(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const role = String(formData.get("role") || "").trim();
    if (!name || !email || !password || !role) return;
    await createUser(name, email, password, role);
    redirect("/admin");
  }

  async function createRoomFormAction(formData: FormData) {
    "use server";
    const number = String(formData.get("number") || "").trim();
    const type = String(formData.get("type") || "").trim();
    const capacity = Number(formData.get("capacity") || 0);
    if (!number || !type || !capacity) return;
    await createRoom({ number, type, capacity });
    revalidatePath("/admin");
  }

  async function updateRoomFormAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    const number = String(formData.get("number") || "").trim();
    const type = String(formData.get("type") || "").trim();
    const capacity = Number(formData.get("capacity") || 0);
    await updateRoomAction(id, { number, type, capacity });
    revalidatePath("/admin");
  }

  async function deleteRoomFormAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    await deleteRoomAction(id);
    revalidatePath("/admin");
  }

  async function createBookingFormAction(formData: FormData) {
    "use server";
    const userId = Number(formData.get("userId"));
    const roomId = Number(formData.get("roomId"));
    const startDateStr = String(formData.get("startDate") || "");
    const endDateStr = String(formData.get("endDate") || "");
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (!userId || !roomId || isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) return;
    await createBookingAction(userId, roomId, startDate, endDate);
    revalidatePath("/admin");
  }

  async function updateBookingFormAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    const roomId = Number(formData.get("roomId"));
    const startDateStr = String(formData.get("startDate") || "");
    const endDateStr = String(formData.get("endDate") || "");
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    await updateBookingAction(id, { roomId, startDate, endDate });
    revalidatePath("/admin");
  }

  async function deleteBookingFormAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    await deleteBookingAction(id);
    revalidatePath("/admin");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-black/5">
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

      <section className="grid md:grid-cols-2 gap-8">
        <div className="p-6 border rounded-xl bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Create user</h2>
          <form action={createUserAction} className="space-y-2">
            <input name="name" placeholder="Name" className="border px-2 py-1 rounded w-full" />
            <input name="email" placeholder="Email" className="border px-2 py-1 rounded w-full" />
            <input name="password" type="password" placeholder="Password" className="border px-2 py-1 rounded w-full" />
            <select name="role" className="border px-2 py-1 rounded w-full">
              <option value="client">client</option>
              <option value="admin">admin</option>
            </select>
            <button className="bg-blue-600 text-white px-3 py-1 rounded">Create</button>
          </form>
          <ul className="mt-4 space-y-1">
            {users.map(u => (
              <li key={u.id} className="text-sm">{u.name} - {u.email} - {u.role}</li>
            ))}
          </ul>
        </div>

        <div className="p-6 border rounded-xl bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Create room</h2>
          <form action={createRoomFormAction} className="space-y-2">
            <input name="number" placeholder="Room number" className="border px-2 py-1 rounded w-full" />
            <input name="type" placeholder="Type" className="border px-2 py-1 rounded w-full" />
            <input name="capacity" type="number" placeholder="Capacity" className="border px-2 py-1 rounded w-full" />
            <button className="bg-blue-600 text-white px-3 py-1 rounded">Create</button>
          </form>

          <h3 className="font-semibold mt-6">Rooms calendar</h3>
          <ClientRoomsCalendar rooms={rooms} bookings={bookings} />
        </div>
      </section>

      <section className="p-6 border rounded-xl bg-white shadow-sm">
        <h2 className="font-semibold mb-3">Create booking</h2>
        <form action={createBookingFormAction} className="grid md:grid-cols-5 gap-2 items-end">
          <select name="userId" className="border px-2 py-1 rounded">
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select name="roomId" className="border px-2 py-1 rounded">
            {rooms.map(r => (
              <option key={r.id} value={r.id}>Room {r.number}</option>
            ))}
          </select>
          <input type="datetime-local" name="startDate" className="border px-2 py-1 rounded" />
          <input type="datetime-local" name="endDate" className="border px-2 py-1 rounded" />
          <button className="bg-blue-600 text-white px-3 py-1 rounded">Create</button>
        </form>
      </section>

      <section className="p-6 border rounded-xl bg-white shadow-sm">
        <h2 className="font-semibold mb-3">All bookings</h2>
        <ul className="space-y-3">
          {bookings.map(b => (
            <li key={b.id} className="border rounded-xl bg-white p-3 shadow-sm">
              <form action={updateBookingFormAction} className="grid md:grid-cols-6 gap-2 items-end">
                <input type="hidden" name="id" value={b.id} />
                <div className="text-sm md:col-span-2">{b.user.name}</div>
                <select name="roomId" defaultValue={b.room.id} className="border px-2 py-1 rounded">
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>Room {r.number}</option>
                  ))}
                </select>
                <input type="datetime-local" name="startDate" defaultValue={new Date(b.startDate).toISOString().slice(0,16)} className="border px-2 py-1 rounded" />
                <input type="datetime-local" name="endDate" defaultValue={new Date(b.endDate).toISOString().slice(0,16)} className="border px-2 py-1 rounded" />
                <button className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
              </form>
              <form action={deleteBookingFormAction} className="mt-2">
                <input type="hidden" name="id" value={b.id} />
                <button className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
      </div>
    </main>
  );
}

// client wrapper moved to components/ClientRoomsCalendar.tsx


