import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientCalendar from "@/components/ClientCalendar";

export default async function ClientPage() {
  const cookieStore = await cookies();
  const uid = Number(cookieStore.get("uid")?.value || 0);
  const role = cookieStore.get("role")?.value;
  if (!uid || !role) redirect("/");

  const me = await prisma.user.findUnique({ where: { id: uid } });
  if (!me) redirect("/");

  const myBookings = await prisma.booking.findMany({
    where: { userId: uid },
    include: { room: true },
    orderBy: { startDate: "asc" },
  });

  const rooms = await prisma.room.findMany({ orderBy: { number: "asc" } });

  async function createBookingAction(formData: FormData) {
    "use server";
    const roomId = Number(formData.get("roomId"));
    const startDateStr = String(formData.get("startDate") || "");
    const endDateStr = String(formData.get("endDate") || "");
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (!roomId || isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) return;

    const overlap = await prisma.booking.findFirst({
      where: {
        roomId,
        OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
      },
    });
    if (overlap) redirect("/client?error=overlap");

    await prisma.booking.create({ data: { userId: uid, roomId, startDate, endDate } });
    redirect("/client");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-black/5">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-500 to-sky-500" />
            <span className="font-semibold tracking-tight">Client dashboard</span>
          </div>
          <div className="text-sm text-gray-600">Welcome, {me.name}</div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* Form pentru creare rezervare */}
        <section className="p-6 border rounded-xl bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Create booking</h2>
          <form action={createBookingAction} className="grid md:grid-cols-4 gap-2 items-end">
            <select name="roomId" className="border px-2 py-1 rounded">
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.number} ({r.type})
                </option>
              ))}
            </select>
            <input type="datetime-local" name="startDate" className="border px-2 py-1 rounded" />
            <input type="datetime-local" name="endDate" className="border px-2 py-1 rounded" />
            <button className="bg-blue-600 text-white px-3 py-1 rounded">Book</button>
          </form>
        </section>

        {/* Calendarul rezervărilor */}
        <section className="p-6 border rounded-xl bg-white shadow-sm">
          <h2 className="font-semibold mb-3">My bookings calendar</h2>
          <ClientCalendar bookings={myBookings.map((b) => ({
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
            {myBookings.map((b) => (
              <li key={b.id} className="text-sm border rounded p-2">
                Room {b.room.number} ({b.room.type}) from {new Date(b.startDate).toLocaleString()} to{" "}
                {new Date(b.endDate).toLocaleString()}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
