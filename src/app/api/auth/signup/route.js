import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (name.length < 2 || name.length > 100 || !emailPattern.test(email) || password.length < 6) {
      return NextResponse.json({ detail: "Enter a valid name, email, and password of at least 6 characters." }, { status: 422 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ detail: "An account with this email already exists." }, { status: 409 });
    const user = await prisma.user.create({ data: { name, email, passwordHash: await hashPassword(password) }, select: { id: true, name: true, email: true } });
    await createSession(user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ detail: "Unable to create account." }, { status: 500 });
  }
}
