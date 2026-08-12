export function rowLabel(index) {
  let label = "";
  let value = index + 1;
  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return label;
}

export function parseEventId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }
  return id;
}

export function serializeEvent(event, bookings = []) {
  const booked = new Set(bookings.map((b) => b.seatId));
  return {
    id: event.id,
    name: event.name,
    date: event.date.toISOString().slice(0, 10),
    seats: event.seats.map((seat) => ({
      id: seat.id,
      seat_number: seat.seatNumber,
      row: seat.row,
      column: seat.column,
      status: seat.isBlocked
        ? "unavailable"
        : booked.has(seat.id)
          ? "booked"
          : "available",
    })),
  };
}
