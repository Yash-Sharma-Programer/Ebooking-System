"use client";

import { useMemo } from "react";
import Seat from "./Seat";

/**
 * @param {{ seats: import('@/lib/api').Seat[], selectedIds: Set<number>, onToggleSeat: (seat: import('@/lib/api').Seat) => void }} props
 */
export default function SeatMap({ seats, selectedIds, onToggleSeat }) {
  const rows = useMemo(() => {
    const grouped = new Map();
    for (const seat of seats) {
      if (!grouped.has(seat.row)) grouped.set(seat.row, []);
      grouped.get(seat.row).push(seat);
    }
    for (const rowSeats of grouped.values()) {
      rowSeats.sort((a, b) => a.column - b.column);
    }
    return Array.from(grouped.entries());
  }, [seats]);

  if (seats.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-paper/20 py-12 text-center text-paper/50">
        No seats configured for this event yet.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto mb-6 w-full max-w-2xl">
        <div className="h-2 rounded-full bg-gradient-to-r from-transparent via-marquee/70 to-transparent" />
        <p className="mt-2 text-center text-[11px] tracking-[0.3em] text-paper/40 font-mono uppercase">
          Stage
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 overflow-x-auto pb-2">
        {rows.map(([row, rowSeats]) => (
          <div key={row} className="flex items-center gap-2">
            <span className="w-4 text-right font-mono text-xs text-paper/40 shrink-0">{row}</span>
            <div className="flex gap-1.5 sm:gap-2">
              {rowSeats.map((seat) => (
                <Seat
                  key={seat.id}
                  seat={seat}
                  isSelected={selectedIds.has(seat.id)}
                  onToggle={onToggleSeat}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
