import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  try {
    await prisma.booking.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
