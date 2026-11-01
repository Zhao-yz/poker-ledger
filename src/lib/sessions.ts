// Shared types and calculations for sessions. Hours are always computed from the times, never stored.

export type Venue = { id: number; name: string; city: string | null };

export type Session = {
  id: number;
  venue_id: number;
  played_on: string; // YYYY-MM-DD
  start_time: string; // HH:MM or HH:MM:SS
  end_time: string;
  stakes: string | null;
  net: number;
  buy_in: number | null;
  cash_out: number | null;
  notes: string | null;
  venues?: { name: string } | null;
};

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Hours played. A session that ends at or before its start time ran past midnight. */
export function sessionHours(start: string, end: string): number {
  let minutes = minutesOf(end) - minutesOf(start);
  if (minutes <= 0) minutes += 24 * 60;
  return minutes / 60;
}

/** Net result. Stored directly because many logged sessions only have the net, not buy-in and cash-out. */
export function sessionNet(s: Pick<Session, "net">): number {
  return Number(s.net);
}

export function formatMoney(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, "0")}${suffix}`;
}
