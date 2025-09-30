import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { userUpdateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const data = await request.json();
  const result = userUpdateSchema.safeParse(data);
  if (!result.success) {
    return NextResponse.json({ error: "validation_error", details: result.error.issues }, { status: 400 });
  }
  try {
    const updateData: any = {};
    if (typeof data.name === "string" && data.name.length > 0) {
      updateData.name = data.name;
    }
    if (typeof data.email === "string" && data.email.length > 0) {
      updateData.email = data.email;
    }
    if (typeof data.password === "string" && data.password.length > 0) {
      updateData.password = data.password;
    }
    await prisma.user.update({
      where: { id: Number(data.id) },
      data: updateData,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}
