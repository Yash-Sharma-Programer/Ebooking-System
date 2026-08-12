/**
 * @param {{ bookings: import('@/lib/api').Booking[] }} props
 */
export default function BookingTable({ bookings }) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-paper/20 py-10 text-center text-paper/40 text-sm">
        No bookings yet for this event.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-paper/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-ink-soft/80 text-left text-paper/50 text-xs uppercase tracking-widest font-mono">
            <th className="px-4 py-3">Seat</th>
            <th className="px-4 py-3">Booker</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Booked at</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-t border-paper/10">
              <td className="px-4 py-3 font-mono text-marquee">{b.seat_number ?? b.seat_id}</td>
              <td className="px-4 py-3">{b.booker_name}</td>
              <td className="px-4 py-3 text-paper/70">{b.booker_email}</td>
              <td className="px-4 py-3 text-paper/50 text-xs">
                {b.created_at ? new Date(b.created_at).toLocaleString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
