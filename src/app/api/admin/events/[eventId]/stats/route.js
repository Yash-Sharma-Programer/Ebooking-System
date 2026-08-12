import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseEventId } from "@/lib/server/events";

export async function GET(_request, { params }) {
  const eventId = parseEventId((await params).eventId);
  if (!eventId) return NextResponse.json({ detail: "Invalid event id" }, { status: 400 });

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ detail: "Event not found" }, { status: 404 });

    const [totalSeats, unavailableSeats, bookedSeats] = await Promise.all([
      prisma.seat.count({ where: { eventId } }),
      prisma.seat.count({ where: { eventId, isBlocked: true } }),
      prisma.booking.count({ where: { eventId } }),
    ]);

    return NextResponse.json({
      total_seats: totalSeats,
      booked_seats: bookedSeats,
      available_seats: Math.max(totalSeats - unavailableSeats - bookedSeats, 0),
      unavailable_seats: unavailableSeats,
    });
  } catch {
    return NextResponse.json({ detail: "Internal server error." }, { status: 500 });
  }
}
