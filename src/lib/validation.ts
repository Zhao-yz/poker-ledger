import { todayInAppZone } from "./dates";
import { sessionHours } from "./sessions";

export type SessionInput = {
  played_on: string;
  venue_id: string;
  new_venue: string;
  start_time: string;
  end_time: string;
  stakes: string;
  net: string;
  buy_in: string;
  cash_out: string;
  notes: string;
};

export type FieldErrors = Partial<Record<keyof SessionInput | "venue", string>>;

// Longest real session so far is 15.75h; anything past 18h is almost certainly a typo.
const MAX_HOURS = 18;

const blank = (v: string) => v.trim() === "";
const isNumber = (v: string) => !blank(v) && Number.isFinite(Number(v));

/** The net to store: typed directly, or worked out from buy-in and cash-out when those are given. */
export function resolveNet(input: Pick<SessionInput, "net" | "buy_in" | "cash_out">): number | null {
  if (isNumber(input.buy_in) && isNumber(input.cash_out)) return Number(input.cash_out) - Number(input.buy_in);
  if (isNumber(input.net)) return Number(input.net);
  return null;
}

/** Net worked out from buy-in and cash-out for the form to show, or null until both are valid. */
export function workedOutNet(buyIn: string, cashOut: string): string | null {
  if (!isNumber(buyIn) || !isNumber(cashOut)) return null;
  if (Number(buyIn) < 0 || Number(cashOut) < 0) return null;
  return String(Number(cashOut) - Number(buyIn));
}

/** Checks a submitted session form. Returns one friendly message per problem field. */
export function validateSession(input: SessionInput, today = todayInAppZone()): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.played_on) errors.played_on = "Pick the date you played.";
  else if (input.played_on > today) errors.played_on = "That date is in the future.";

  if (!input.venue_id && !input.new_venue.trim()) errors.venue = "Choose a venue or type a new one.";

  if (!input.start_time) errors.start_time = "Add the time you sat down.";
  if (!input.end_time) errors.end_time = "Add the time you left.";
  if (input.start_time && input.end_time) {
    if (input.start_time === input.end_time) {
      errors.end_time = "End time matches the start time.";
    } else if (sessionHours(input.start_time, input.end_time) > MAX_HOURS) {
      errors.end_time = `That makes the session longer than ${MAX_HOURS} hours. Check the times.`;
    }
  }

  // Buy-in and cash-out are optional, but if one is given they're checked, and they come as a pair.
  for (const key of ["buy_in", "cash_out"] as const) {
    const label = key === "buy_in" ? "buy-in" : "cash-out";
    if (!blank(input[key]) && (!isNumber(input[key]) || Number(input[key]) < 0))
      errors[key] = `The ${label} has to be a number of 0 or more.`;
  }
  if (blank(input.buy_in) !== blank(input.cash_out)) {
    const missing = blank(input.buy_in) ? "buy_in" : "cash_out";
    errors[missing] = "Fill in both buy-in and cash-out, or leave both blank and enter the net.";
  }

  if (!blank(input.net) && !isNumber(input.net)) errors.net = "Net has to be a number, e.g. -250 or 900.";
  const bothAmounts = isNumber(input.buy_in) && isNumber(input.cash_out);
  if (!bothAmounts && blank(input.net)) errors.net = "Enter the net result (or buy-in and cash-out).";
  if (bothAmounts && isNumber(input.net) && Number(input.net) !== Number(input.cash_out) - Number(input.buy_in))
    errors.net = `Net doesn't match cash-out − buy-in (${Number(input.cash_out) - Number(input.buy_in)}). Fix one, or clear the net.`;

  return errors;
}
