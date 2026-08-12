import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseEventId } from "@/lib/server/events";
import { getCurrentUser } from "@/lib/auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request, { params }) {
  const eventId = parseEventId((await params).id);
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: "Please sign in before booking seats." }, { status: 401 });
  if (!eventId) return NextResponse.json({ detail: "Invalid event id" }, { status: 400 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  const seatIds = Array.isArray(body.seat_ids)
    ? [...new Set(body.seat_ids.map(Number).filter((id) => Number.isInteger(id) && id > 0))]
    : [];
  const name = typeof body.booker_name === "string" ? body.booker_name.trim() : "";
  const email = typeof body.booker_email === "string" ? body.booker_email.trim() : "";

  if (!seatIds.length || !name || name.length > 255 || !emailPattern.test(email)) {
    return NextResponse.json({ detail: "Please provide valid seat_ids, booker_name, and booker_email." }, { status: 422 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new Error("EVENT_NOT_FOUND");

      const seats = await tx.seat.findMany({ where: { id: { in: seatIds }, eventId } });
      if (seats.length !== seatIds.length) throw new Error(`SEAT_NOT_FOUND:${seatIds.filter((id) => !seats.some((s) => s.id === id)).join(",")}`);

      const blocked = seats.filter((seat) => seat.isBlocked).map((seat) => seat.id);
      if (blocked.length) throw new Error(`SEAT_BLOCKED:${blocked.join(",")}`);

      const existing = await tx.booking.findMany({ where: { eventId, seatId: { in: seatIds } }, select: { seatId: true } });
      if (existing.length) throw new Error(`SEAT_BOOKED:${existing.map((b) => b.seatId).join(",")}`);

      const bookings = [];
      for (const seatId of seatIds) {
        bookings.push(
          await tx.booking.create({
            data: { eventId, seatId, bookerName: name, bookerEmail: email, userId: user.id },
            include: { seat: true },
          }),
        );
      }
      return bookings;
    });

    return NextResponse.json(
      result.map((booking) => ({
        id: booking.id,
        seat_id: booking.seatId,
        seat_number: booking.seat.seatNumber,
        booker_name: booking.bookerName,
        booker_email: booking.bookerEmail,
        created_at: booking.createdAt.toISOString(),
      })),
      { status: 201 },
    );
  } catch (error) {
    const message = String(error?.message || "");
    if (message === "EVENT_NOT_FOUND") return NextResponse.json({ detail: "Event not found" }, { status: 404 });
    if (message.startsWith("SEAT_NOT_FOUND:")) return NextResponse.json({ detail: `Seat id(s) not found for this event: ${message.slice(15)}` }, { status: 404 });
    if (message.startsWith("SEAT_BLOCKED:")) return NextResponse.json({ detail: `Seat id(s) are blocked/unavailable: ${message.slice(13)}` }, { status: 409 });
    if (message.startsWith("SEAT_BOOKED:")) return NextResponse.json({ detail: `Seat id(s) already booked: ${message.slice(12)}` }, { status: 409 });
    // Prisma's unique constraint is the final double-booking guard.
    if (error?.code === "P2002") return NextResponse.json({ detail: "One or more selected seats were just booked by someone else." }, { status: 409 });
    return NextResponse.json({ detail: "Internal server error." }, { status: 500 });
  }
}
