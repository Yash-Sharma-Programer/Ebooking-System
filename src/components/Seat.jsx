"use client";

import clsx from "clsx";

/**
 * @param {{ seat: import('@/lib/api').Seat, isSelected: boolean, onToggle: (seat: import('@/lib/api').Seat) => void }} props
 */
export default function Seat({ seat, isSelected, onToggle }) {
  const isBookable = seat.status === "available";
  const disabled = !isBookable;

  const state = isSelected ? "selected" : seat.status;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(seat)}
      aria-pressed={isSelected}
      aria-label={`Seat ${seat.seat_number} — ${isSelected ? "selected" : seat.status}`}
      title={`${seat.seat_number} · ${isSelected ? "selected" : seat.status}`}
      className={clsx(
        "font-mono text-[11px] sm:text-xs w-8 h-8 sm:w-9 sm:h-9 rounded-md border transition-all duration-150 shrink-0",
        "flex items-center justify-center leading-none select-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marquee",
        state === "available" &&
          "bg-transparent border-sage text-sage-soft hover:bg-sage/20 cursor-pointer",
        state === "selected" &&
          "bg-marquee border-marquee text-ink font-semibold shadow-[0_0_0_3px_rgba(232,172,61,0.25)] cursor-pointer",
        state === "booked" && "bg-ink-soft border-ink-soft text-slate cursor-not-allowed opacity-70",
        state === "unavailable" &&
          "bg-danger-soft/10 border-danger/50 text-danger/80 cursor-not-allowed opacity-70 line-through"
      )}
    >
      {seat.seat_number}
    </button>
  );
}
