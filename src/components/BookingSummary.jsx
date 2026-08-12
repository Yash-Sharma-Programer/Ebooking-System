"use client";

import BookingForm from "./BookingForm";
import Link from "next/link";

/**
 * @param {{
 *   eventName: string,
 *   eventDate: string,
 *   selectedSeats: import("@/lib/api").Seat[],
 *   onConfirm: (bookerName: string, bookerEmail: string) => void,
 *   submitting: boolean,
 *   user?: { name?: string, email?: string } | null
 * }} props
 */
export default function BookingSummary({
  eventName,
  eventDate,
  selectedSeats,
  onConfirm,
  submitting,
  user,
}) {
  const hasSeats = selectedSeats.length > 0;

  return (
    <div className="rounded-2xl bg-paper text-ink shadow-xl overflow-hidden">
      {/* Event information */}
      <div className="px-6 py-5">
        <p className="font-display text-3xl tracking-wide leading-none">
          {eventName || "Your Event"}
        </p>

        <p className="mt-1 text-sm text-ink/60">
          {eventDate
            ? new Date(eventDate + "T00:00:00").toLocaleDateString(
                undefined,
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )
            : "Date TBA"}
        </p>
      </div>

      <div className="ticket-tear mx-6" />

      {/* Selected seats */}
      <div className="px-6 py-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-ink/50 mb-2">
          Selected seats ({selectedSeats.length})
        </h3>

        {hasSeats ? (
          <div className="flex flex-wrap gap-2 mb-1">
            {selectedSeats.map((s) => (
              <span
                key={s.id}
                className="font-mono text-xs px-2 py-1 rounded bg-marquee/20 border border-marquee text-ink"
              >
                {s.seat_number}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/50">
            Tap seats on the map to select them — pick as many as you need.
          </p>
        )}
      </div>

      <div className="ticket-tear mx-6" />

      {/* Booking / Authentication */}
      <div className="px-6 py-5">
        {!user ? (
          <div className="space-y-3">
            <p className="text-sm text-ink/60">
              Sign in or create an account to complete your booking.
            </p>

            <Link
              href="/signin"
              className="block w-full text-center rounded-lg bg-velvet text-paper font-semibold py-3 text-sm hover:bg-velvet/90"
            >
              Sign in to book
            </Link>

            <Link
              href="/signup"
              className="block w-full text-center rounded-lg border border-velvet text-velvet font-semibold py-3 text-sm hover:bg-velvet/10"
            >
              Create an account
            </Link>
          </div>
        ) : (
          <BookingForm
            disabled={!hasSeats}
            submitting={submitting}
            selectedCount={selectedSeats.length}
            onConfirm={onConfirm}
            user={user}
          />
        )}
      </div>
    </div>
  );
}