import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseEventId } from "@/lib/server/events";

export async function GET(_request, { params }) {
  const eventId = parseEventId((await params).eventId);
  if (!eventId) return NextResponse.json({ detail: "Invalid event id" }, { status: 400 });

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ detail: "Event not found" }, { status: 404 });

    const bookings = await prisma.booking.findMany({
      where: { eventId },
      include: { seat: true },
      orderBy: [{ seat: { row: "asc" } }, { seat: { column: "asc" } }],
    });

    return NextResponse.json(bookings.map((b) => ({
      id: b.id, seat_id: b.seatId, seat_number: b.seat.seatNumber,
      booker_name: b.bookerName, booker_email: b.bookerEmail,
      created_at: b.createdAt.toISOString(),
    })));
  } catch {
    return NextResponse.json({ detail: "Internal server error." }, { status: 500 });
  }
}
