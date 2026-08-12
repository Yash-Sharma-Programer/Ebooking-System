"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import SeatMap from "@/components/SeatMap";
import SeatLegend from "@/components/SeatLegend";
import BookingSummary from "@/components/BookingSummary";
import Notification from "@/components/Notification";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [eventsState, setEventsState] = useState("loading");

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [event, setEvent] = useState(null);
  const [eventState, setEventState] = useState("loading");

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ---- Load current signed-in user ----
  useEffect(() => {
    api.me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  async function handleSignOut() {
    await api.signOut();
    setUser(null);
  }

  // ---- Load events list ----
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: kick off a loading state before the fetch below
    setEventsState("loading");
    api
      .listEvents()
      .then((list) => {
        if (cancelled) return;
        setEvents(list);
        if (list.length === 0) {
          setEventsState("empty");
        } else {
          setEventsState("ready");
          setSelectedEventId((prev) => prev ?? list[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setEventsState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Load selected event + seats ----
  const loadEvent = useCallback((eventId, { silent = false } = {}) => {
    if (!silent) setEventState("loading");
    return api
      .getEvent(eventId)
      .then((data) => {
        setEvent(data);
        setEventState("ready");
        // Drop any locally-selected seats that are no longer available
        // (they may have just been booked by someone else)
        setSelectedIds((prev) => {
          const next = new Set();
          for (const seat of data.seats) {
            if (prev.has(seat.id) && seat.status === "available") next.add(seat.id);
          }
          return next;
        });
      })
      .catch(() => {
        setEventState("error");
      });
  }, []);

  useEffect(() => {
    if (selectedEventId == null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: fetch seat data whenever the selected event changes
    loadEvent(selectedEventId);
  }, [selectedEventId, loadEvent]);

  // ---- Refetch on window focus, so seat state stays fresh ----
  const selectedEventIdRef = useRef(null);
  useEffect(() => {
    selectedEventIdRef.current = selectedEventId;
  }, [selectedEventId]);
  useEffect(() => {
    const onFocus = () => {
      if (selectedEventIdRef.current != null) {
        loadEvent(selectedEventIdRef.current, { silent: true });
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadEvent]);

  const handleToggleSeat = (seat) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(seat.id)) next.delete(seat.id);
      else next.add(seat.id);
      return next;
    });
  };

  const handleConfirm = async (bookerName, bookerEmail) => {
    if (!event || selectedIds.size === 0) return;
    if (!user) { window.location.href = "/signin"; return; }
    setSubmitting(true);
    setNotice(null);
    try {
      const seatIds = Array.from(selectedIds);
      await api.bookSeats(event.id, { seat_ids: seatIds, booker_name: bookerName, booker_email: bookerEmail });
      setNotice({
        type: "success",
        message: `Booked ${seatIds.length} seat${seatIds.length > 1 ? "s" : ""} for ${bookerName}. Enjoy the show!`,
      });
      setSelectedIds(new Set());
      await loadEvent(event.id, { silent: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setNotice({ type: "error", message });
      // Refresh so the seat map reflects reality if the conflict came from someone else's booking
      await loadEvent(event.id, { silent: true });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSeats = event ? event.seats.filter((s) => selectedIds.has(s.id)) : [];

  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-paper/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] tracking-[0.35em] text-marquee font-mono uppercase">Box Office</p>
            <h1 className="font-display text-4xl sm:text-5xl tracking-wide leading-none mt-1">
              Reserve Your Seats
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="hidden sm:inline-block text-xs font-mono uppercase tracking-widest text-paper/50 hover:text-paper border border-paper/20 rounded-full px-4 py-2 transition-colors">Admin</Link>
            {authLoading ? null : user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs font-mono text-paper/60">Hi, {user.name}</span>
                <button onClick={handleSignOut} className="text-xs font-mono uppercase tracking-widest text-paper/60 hover:text-paper border border-paper/20 rounded-full px-4 py-2 transition-colors">Sign out</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/signin" className="text-xs font-mono uppercase tracking-widest text-paper/70 hover:text-paper border border-paper/20 rounded-full px-4 py-2">Sign in</Link>
                <Link href="/signup" className="text-xs font-mono uppercase tracking-widest bg-marquee text-ink rounded-full px-4 py-2">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 flex-1">
        {eventsState === "loading" && <SkeletonBlock label="Loading events…" />}

        {eventsState === "error" && (
          <ErrorBlock message="Couldn't load events. Check that the API server is running." />
        )}

        {eventsState === "empty" && (
          <EmptyBlock
            title="No events yet"
            message="Once an event is created in the admin dashboard, it'll show up here for booking."
          />
        )}

        {eventsState === "ready" && (
          <>
            {events.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {events.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEventId(e.id)}
                    className={`text-sm px-4 py-2 rounded-full border font-mono transition-colors ${
                      selectedEventId === e.id
                        ? "bg-marquee border-marquee text-ink"
                        : "border-paper/20 text-paper/60 hover:text-paper"
                    }`}
                  >
                    {e.name}
                  </button>
                ))}
              </div>
            )}

            {eventState === "loading" && <SkeletonBlock label="Loading seat map…" />}
            {eventState === "error" && <ErrorBlock message="Couldn't load this event's seat map." />}

            {eventState === "ready" && event && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
                <div className="rounded-2xl bg-ink-soft/60 border border-paper/10 p-4 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <SeatLegend />
                  </div>
                  <SeatMap seats={event.seats} selectedIds={selectedIds} onToggleSeat={handleToggleSeat} />
                </div>

                <div className="lg:sticky lg:top-8">
                  <BookingSummary
                    eventName={event.name}
                    eventDate={event.date}
                    selectedSeats={selectedSeats}
                    onConfirm={handleConfirm}
                    submitting={submitting}
                    user={user}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {notice && (
        <Notification type={notice.type} message={notice.message} onDismiss={() => setNotice(null)} />
      )}
    </main>
  );
}

function SkeletonBlock({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-paper/40 gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-paper/20 border-t-marquee animate-spin" />
      <p className="text-sm font-mono">{label}</p>
    </div>
  );
}

function ErrorBlock({ message }) {
  return (
    <div className="rounded-xl border border-danger/40 bg-danger-soft/10 px-6 py-10 text-center">
      <p className="text-danger font-semibold mb-1">Something went wrong</p>
      <p className="text-sm text-paper/60">{message}</p>
    </div>
  );
}

function EmptyBlock({ title, message }) {
  return (
    <div className="rounded-xl border border-dashed border-paper/20 px-6 py-16 text-center">
      <p className="font-display text-2xl tracking-wide mb-2">{title}</p>
      <p className="text-sm text-paper/50">{message}</p>
      <Link
        href="/admin"
        className="inline-block mt-5 text-xs font-mono uppercase tracking-widest text-ink bg-marquee rounded-full px-5 py-2.5"
      >
        Go to Admin
      </Link>
    </div>
  );
}
