"use client";

import { useState } from "react";

/**
 * @param {{ onCreate: (payload: { name: string, date: string, rows: number, seats_per_row: number }) => Promise<void>, submitting: boolean }} props
 */
export default function EventForm({ onCreate, submitting }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [rows, setRows] = useState(5);
  const [seatsPerRow, setSeatsPerRow] = useState(10);

  const canSubmit = name.trim().length > 0 && date.length > 0 && rows > 0 && seatsPerRow > 0 && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    await onCreate({ name: name.trim(), date, rows, seats_per_row: seatsPerRow });
    setName("");
    setDate("");
    setRows(5);
    setSeatsPerRow(10);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label htmlFor="event_name" className="block text-xs font-semibold uppercase tracking-widest text-paper/50 mb-1">
          Event name
        </label>
        <input
          id="event_name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Autumn Jazz Night"
          required
          className="w-full rounded-lg border border-paper/15 bg-ink px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:ring-2 focus:ring-marquee"
        />
      </div>
      <div>
        <label htmlFor="event_date" className="block text-xs font-semibold uppercase tracking-widest text-paper/50 mb-1">
          Event date
        </label>
        <input
          id="event_date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded-lg border border-paper/15 bg-ink px-3 py-2 text-sm text-paper focus:outline-none focus:ring-2 focus:ring-marquee"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="rows" className="block text-xs font-semibold uppercase tracking-widest text-paper/50 mb-1">
            Rows
          </label>
          <input
            id="rows"
            type="number"
            min={1}
            max={50}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            required
            className="w-full rounded-lg border border-paper/15 bg-ink px-3 py-2 text-sm text-paper focus:outline-none focus:ring-2 focus:ring-marquee"
          />
        </div>
        <div>
          <label htmlFor="seats_per_row" className="block text-xs font-semibold uppercase tracking-widest text-paper/50 mb-1">
            Seats / row
          </label>
          <input
            id="seats_per_row"
            type="number"
            min={1}
            max={50}
            value={seatsPerRow}
            onChange={(e) => setSeatsPerRow(Number(e.target.value))}
            required
            className="w-full rounded-lg border border-paper/15 bg-ink px-3 py-2 text-sm text-paper focus:outline-none focus:ring-2 focus:ring-marquee"
          />
        </div>
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-marquee text-ink font-semibold px-5 py-2.5 text-sm tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-marquee-soft"
        >
          {submitting ? "Creating…" : "Create event"}
        </button>
      </div>
    </form>
  );
}
