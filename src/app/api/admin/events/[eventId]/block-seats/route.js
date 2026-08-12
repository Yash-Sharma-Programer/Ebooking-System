import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseEventId } from "@/lib/server/events";

export async function POST(request, { params }) {
  const eventId = parseEventId((await params).eventId);
  if (!eventId) return NextResponse.json({ detail: "Invalid event id" }, { status: 400 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 }); }

  const seatIds = Array.isArray(body.seat_ids) ? [...new Set(body.seat_ids.map(Number).filter((id) => Number.isInteger(id) && id > 0))] : [];
  const blocked = body.blocked === undefined ? true : Boolean(body.blocked);
  if (!seatIds.length) return NextResponse.json({ detail: "seat_ids must contain at least one seat." }, { status: 422 });

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ detail: "Event not found" }, { status: 404 });

    const seats = await prisma.seat.findMany({ where: { id: { in: seatIds }, eventId } });
    if (seats.length !== seatIds.length) {
      const missing = seatIds.filter((id) => !seats.some((s) => s.id === id));
      return NextResponse.json({ detail: `Seat id(s) not found for this event: ${missing.join(", ")}` }, { status: 404 });
    }

    // Never make already-booked seats available to admin blocking/unblocking.
    if (!blocked) {
      const booked = await prisma.booking.findMany({ where: { eventId, seatId: { in: seatIds } }, select: { seatId: true } });
      if (booked.length) return NextResponse.json({ detail: "Booked seats cannot be unblocked." }, { status: 409 });
    }

    await prisma.seat.updateMany({ where: { id: { in: seatIds }, eventId }, data: { isBlocked: blocked } });
    return NextResponse.json({ updated: seatIds, blocked });
  } catch {
    return NextResponse.json({ detail: "Internal server error." }, { status: 500 });
  }
}
