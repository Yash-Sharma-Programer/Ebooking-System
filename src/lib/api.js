export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Seat status as returned by the API: "available" | "booked" | "unavailable"
 *
 * @typedef {Object} Seat
 * @property {number} id
 * @property {string} seat_number
 * @property {string} row
 * @property {number} column
 * @property {"available"|"booked"|"unavailable"} status
 *
 * @typedef {Object} EventWithSeats
 * @property {number} id
 * @property {string} name
 * @property {string} date
 * @property {Seat[]} seats
 *
 * @typedef {Object} EventSummary
 * @property {number} id
 * @property {string} name
 * @property {string} date
 * @property {string|null} [created_at]
 *
 * @typedef {Object} Booking
 * @property {number} id
 * @property {number} seat_id
 * @property {string|null} [seat_number]
 * @property {string} booker_name
 * @property {string} booker_email
 * @property {string|null} [created_at]
 *
 * @typedef {Object} Stats
 * @property {number} total_seats
 * @property {number} booked_seats
 * @property {number} available_seats
 * @property {number} unavailable_seats
 */

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch {
      // ignore parse errors, use default message
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined;
  return res.json();
}

export const api = {
  signUp: (payload) => request("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  signIn: (payload) => request("/api/auth/signin", { method: "POST", body: JSON.stringify(payload) }),
  signOut: () => request("/api/auth/signout", { method: "POST" }),
  me: () => request("/api/auth/me"),
  listEvents: () => request("/api/events"),
  getEvent: (eventId) => request(`/api/events/${eventId}`),
  bookSeats: (eventId, payload) =>
    request(`/api/events/${eventId}/bookings`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createEvent: (payload) =>
    request("/api/admin/events", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  blockSeats: (eventId, seat_ids, blocked) =>
    request(`/api/admin/events/${eventId}/block-seats`, {
      method: "POST",
      body: JSON.stringify({ seat_ids, blocked }),
    }),
  getStats: (eventId) => request(`/api/admin/events/${eventId}/stats`),
  listBookings: (eventId) => request(`/api/admin/events/${eventId}/bookings`),
};
