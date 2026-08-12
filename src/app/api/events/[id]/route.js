import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseEventId, serializeEvent } from "@/lib/server/events";

export async function GET(_request, { params }) {
  const eventId = parseEventId((await params).id);
  if (!eventId) return NextResponse.json({ detail: "Invalid event id" }, { status: 400 });

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { seats: { orderBy: [{ row: "asc" }, { column: "asc" }] }, bookings: true },
    });
    if (!event) return NextResponse.json({ detail: "Event not found" }, { status: 404 });
    return NextResponse.json(serializeEvent(event, event.bookings));
  } catch {
    return NextResponse.json({ detail: "Internal server error." }, { status: 500 });
  }
}
