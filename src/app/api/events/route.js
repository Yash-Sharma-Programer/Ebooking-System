import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
    return NextResponse.json(
      events.map((event) => ({
        id: event.id,
        name: event.name,
        date: event.date.toISOString().slice(0, 10),
        created_at: event.createdAt?.toISOString() ?? null,
      })),
    );
  } catch {
    return NextResponse.json({ detail: "Internal server error." }, { status: 500 });
  }
}
