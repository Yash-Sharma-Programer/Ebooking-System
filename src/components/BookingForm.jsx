"use client";

import { useEffect, useState } from "react";

/**
 * @param {{ disabled: boolean, submitting: boolean, selectedCount: number, onConfirm: (bookerName: string, bookerEmail: string) => void }} props
 */
export default function BookingForm({ disabled, submitting, selectedCount, onConfirm, user }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const canSubmit = !disabled && name.trim().length > 0 && email.trim().length > 0 && !submitting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirm(name.trim(), email.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="booker_name" className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1">
          Booker name
        </label>
        <input
          id="booker_name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          required
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-marquee"
        />
      </div>
      <div>
        <label htmlFor="booker_email" className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1">
          Email
        </label>
        <input
          id="booker_email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-marquee"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-velvet text-paper font-semibold py-3 text-sm tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-velvet/90"
      >
        {submitting
          ? "Confirming…"
          : selectedCount > 0
          ? `Confirm booking · ${selectedCount} seat${selectedCount > 1 ? "s" : ""}`
          : "Select seats to continue"}
      </button>
      {disabled && !submitting && (
        <p className="text-center text-xs text-ink/40">Select at least one seat to enable booking.</p>
      )}
    </form>
  );
}
