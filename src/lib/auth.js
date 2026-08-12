import crypto from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "boxoffice_session";

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({ where: { id: userId }, data: { sessionToken: token } });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.user.updateMany({ where: { sessionToken: token }, data: { sessionToken: null } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return prisma.user.findUnique({
    where: { sessionToken: token },
    select: { id: true, name: true, email: true },
  });
}
