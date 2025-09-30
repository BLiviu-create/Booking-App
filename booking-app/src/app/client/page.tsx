import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientPageClient from "./ClientPageClient";

export default async function ClientPage() {
  const cookieStore = await cookies();
  const uid = Number(cookieStore.get("uid")?.value || 0);
  const role = cookieStore.get("role")?.value;
  if (!uid || !role) redirect("/");

  const me = await prisma.user.findUnique({ where: { id: uid } });
  if (!me) redirect("/");

  const myBookingsRaw = await prisma.booking.findMany({
    where: { userId: uid },
    include: { room: true },
    orderBy: { startDate: "asc" },
  });
  const myBookings = myBookingsRaw.map(b => ({
    ...b,
    startDate: String(b.startDate),
    endDate: String(b.endDate),
  }));

  // Removed unused allBookings variable

  const rooms = await prisma.room.findMany({ orderBy: { number: "asc" } });

  // All client logic moved to ClientPageClient

  return <ClientPageClient me={me} myBookings={myBookings} rooms={rooms} uid={uid} />;
}
