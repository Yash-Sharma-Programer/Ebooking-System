"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { api, ApiError } from "@/lib/api";
import EventForm from "@/components/EventForm";
import StatsCard from "@/components/StatsCard";
import BookingTable from "@/components/BookingTable";
import Notification from "@/components/Notification";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [creatingEvent, setCreatingEvent] = useState(false);
  const [selectedForBlock, setSelectedForBlock] = useState(new Set());
  const [blocking, setBlocking] = useState(false);
  const [notice, setNotice] = useState(null);

  const refreshEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const list = await api.listEvents();
      setEvents(list);
      return list;
    } catch {
      setNotice({ type: "error", message: "Couldn't load events." });
      return [];
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: select the newest event once the list loads
    refreshEvents().then((list) => {
      if (list.length > 0) setSelectedEventId(list[list.length - 1].id);
    });
  }, [refreshEvents]);

  const loadEventDetail = useCallback(async (eventId) => {
    setDetailLoading(true);
    try {
      const [eventData, statsData, bookingsData] = await Promise.all([
        api.getEvent(eventId),
        api.getStats(eventId),
        api.listBookings(eventId),
      ]);
      setEvent(eventData);
      setStats(statsData);
      setBookings(bookingsData);
    } catch {
      setNotice({ type: "error", message: "Couldn't load event details." });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEventId != null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reset block-selection whenever the active event changes
      setSelectedForBlock(new Set());
      loadEventDetail(selectedEventId);
    }
  }, [selectedEventId, loadEventDetail]);

  const handleCreateEvent = async (payload) => {
    setCreatingEvent(true);
    try {
      const created = await api.createEvent(payload);
      setNotice({ type: "success", message: `Event "${created.name}" created with its seat map.` });
      const list = await refreshEvents();
      setSelectedEventId(created.id);
      if (list.length === 0) setSelectedEventId(created.id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't create the event.";
      setNotice({ type: "error", message });
    } finally {
      setCreatingEvent(false);
    }
  };

  const toggleBlockSelection = (seatId) => {
    setSelectedForBlock((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) next.delete(seatId);
      else next.add(seatId);
      return next;
    });
  };

  const applyBlock = async (blocked) => {
    if (!event || selectedForBlock.size === 0) return;
    setBlocking(true);
    try {
      await api.blockSeats(event.id, Array.from(selectedForBlock), blocked);
      setNotice({
        type: "success",
        message: `${selectedForBlock.size} seat(s) marked ${blocked ? "unavailable" : "available"}.`,
      });
      setSelectedForBlock(new Set());
      await loadEventDetail(event.id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't update seat status.";
      setNotice({ type: "error", message });
    } finally {
      setBlocking(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-paper/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] tracking-[0.35em] text-marquee font-mono uppercase">Back office</p>
            <h1 className="font-display text-4xl sm:text-5xl tracking-wide leading-none mt-1">
              Admin Dashboard
            </h1>
          </div>
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-widest text-paper/50 hover:text-paper border border-paper/20 rounded-full px-4 py-2 transition-colors"
          >
            View booking page
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 flex-1 space-y-10">
        <section className="rounded-2xl border border-paper/10 bg-ink-soft/60 p-6">
          <h2 className="font-display text-2xl tracking-wide mb-4">Create event</h2>
          <EventForm onCreate={handleCreateEvent} submitting={creatingEvent} />
        </section>

        <section>
          <h2 className="font-display text-2xl tracking-wide mb-4">Manage event</h2>

          {eventsLoading && <p className="text-sm text-paper/50">Loading events…</p>}

          {!eventsLoading && events.length === 0 && (
            <p className="text-sm text-paper/50">No events yet — create one above to get started.</p>
          )}

          {!eventsLoading && events.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {events.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEventId(e.id)}
                  className={clsx(
                    "text-sm px-4 py-2 rounded-full border font-mono transition-colors",
                    selectedEventId === e.id
                      ? "bg-marquee border-marquee text-ink"
                      : "border-paper/20 text-paper/60 hover:text-paper"
                  )}
                >
                  {e.name}
                </button>
              ))}
            </div>
          )}

          {detailLoading && <p className="text-sm text-paper/50">Loading event details…</p>}

          {!detailLoading && event && stats && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatsCard label="Total seats" value={stats.total_seats} accent="slate" />
                <StatsCard label="Booked" value={stats.booked_seats} accent="marquee" />
                <StatsCard label="Available" value={stats.available_seats} accent="sage" />
                <StatsCard label="Unavailable" value={stats.unavailable_seats} accent="danger" />
              </div>

              <div className="rounded-2xl border border-paper/10 bg-ink-soft/60 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-display text-2xl tracking-wide">Seat management</h3>
                    <p className="text-sm text-paper/50">
                      Tap seats to select them, then block or unblock (e.g. VIP holds, out-of-service seats).
                      Booked seats can&apos;t be selected here.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => applyBlock(true)}
                      disabled={selectedForBlock.size === 0 || blocking}
                      className="text-xs font-mono uppercase tracking-widest rounded-full px-4 py-2 bg-danger text-paper disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Block selected
                    </button>
                    <button
                      onClick={() => applyBlock(false)}
                      disabled={selectedForBlock.size === 0 || blocking}
                      className="text-xs font-mono uppercase tracking-widest rounded-full px-4 py-2 bg-sage text-ink disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Unblock selected
                    </button>
                  </div>
                </div>

                <AdminSeatGrid
                  seats={event.seats}
                  selected={selectedForBlock}
                  onToggle={toggleBlockSelection}
                />
              </div>

              <div className="rounded-2xl border border-paper/10 bg-ink-soft/60 p-6">
                <h3 className="font-display text-2xl tracking-wide mb-4">Bookings</h3>
                <BookingTable bookings={bookings} />
              </div>
            </div>
          )}
        </section>
      </div>

      {notice && (
        <Notification type={notice.type} message={notice.message} onDismiss={() => setNotice(null)} />
      )}
    </main>
  );
}

function AdminSeatGrid({ seats, selected, onToggle }) {
  const rows = new Map();
  for (const seat of seats) {
    if (!rows.has(seat.row)) rows.set(seat.row, []);
    rows.get(seat.row).push(seat);
  }
  for (const rowSeats of rows.values()) rowSeats.sort((a, b) => a.column - b.column);

  if (seats.length === 0) {
    return <p className="text-sm text-paper/40">This event has no seats configured.</p>;
  }

  return (
    <div className="flex flex-col items-start gap-2 overflow-x-auto pb-2">
      {Array.from(rows.entries()).map(([row, rowSeats]) => (
        <div key={row} className="flex items-center gap-2">
          <span className="w-4 text-right font-mono text-xs text-paper/40 shrink-0">{row}</span>
          <div className="flex gap-1.5">
            {rowSeats.map((seat) => {
              const isSelected = selected.has(seat.id);
              const isBooked = seat.status === "booked";
              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={isBooked}
                  onClick={() => onToggle(seat.id)}
                  title={`${seat.seat_number} · ${seat.status}`}
                  className={clsx(
                    "font-mono text-[11px] w-8 h-8 rounded-md border transition-all shrink-0 flex items-center justify-center",
                    isBooked && "bg-ink-soft border-ink-soft text-slate cursor-not-allowed opacity-70",
                    !isBooked &&
                      isSelected &&
                      "bg-marquee border-marquee text-ink font-semibold shadow-[0_0_0_3px_rgba(232,172,61,0.25)]",
                    !isBooked &&
                      !isSelected &&
                      seat.status === "unavailable" &&
                      "bg-danger-soft/10 border-danger/50 text-danger/80",
                    !isBooked &&
                      !isSelected &&
                      seat.status === "available" &&
                      "bg-transparent border-sage text-sage-soft hover:bg-sage/20"
                  )}
                >
                  {seat.seat_number}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
