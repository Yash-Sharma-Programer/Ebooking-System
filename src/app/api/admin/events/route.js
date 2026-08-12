import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rowLabel } from "@/lib/server/events";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 }); }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const date = typeof body.date === "string" ? new Date(body.date) : null;
  const rows = Number(body.rows);
  const seatsPerRow = Number(body.seats_per_row);

  if (!name || name.length > 255 || !date || Number.isNaN(date.getTime()) ||
      !Number.isInteger(rows) || rows < 1 || rows > 50 ||
      !Number.isInteger(seatsPerRow) || seatsPerRow < 1 || seatsPerRow > 50) {
    return NextResponse.json({ detail: "Invalid event data." }, { status: 422 });
  }

  try {
    const event = await prisma.event.create({
      data: {
        name,
        date,
        seats: {
          create: Array.from({ length: rows }, (_, r) =>
            Array.from({ length: seatsPerRow }, (_, c) => ({
              seatNumber: `${rowLabel(r)}${c + 1}`,
              row: rowLabel(r),
              column: c + 1,
            })),
          ).flat(),
        },
      },
    });
    return NextResponse.json({
      id: event.id, name: event.name, date: event.date.toISOString().slice(0, 10), created_at: event.createdAt.toISOString(),
    }, { status: 201 });
  } catch {
    return NextResponse.json({ detail: "Internal server error." }, { status: 500 });
  }
}
