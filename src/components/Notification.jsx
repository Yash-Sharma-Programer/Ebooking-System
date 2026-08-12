"use client";

import clsx from "clsx";

/**
 * @param {{ type: "success"|"error", message: string, onDismiss: () => void }} props
 */
export default function Notification({ type, message, onDismiss }) {
  return (
    <div
      role="alert"
      className={clsx(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md rounded-xl px-4 py-3 shadow-2xl flex items-start gap-3",
        type === "success" && "bg-sage text-ink",
        type === "error" && "bg-danger text-paper"
      )}
    >
      <span className="text-lg leading-none mt-0.5" aria-hidden="true">
        {type === "success" ? "✓" : "⚠"}
      </span>
      <p className="text-sm flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-sm opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
