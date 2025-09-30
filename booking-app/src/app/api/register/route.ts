import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = userSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.issues }, { status: 400 });
    }
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: result.data.email } });
    if (existing) {
      return NextResponse.json({ success: false, errors: [{ path: ["email"], message: "Email already registered" }] }, { status: 400 });
    }
    const user = await prisma.user.create({ data: result.data });
    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ success: false, errors: [{ message: "Server error" }] }, { status: 500 });
  }
}
