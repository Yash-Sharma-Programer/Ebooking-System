import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ detail: "Invalid email or password." }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    return NextResponse.json({ detail: "Unable to sign in." }, { status: 500 });
  }
}
