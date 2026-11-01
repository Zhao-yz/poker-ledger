import { sessionHours } from "./sessions";

export type SessionInput = {
  played_on: string;
  venue_id: string;
  new_venue: string;
  start_time: string;
  end_time: string;
  stakes: string;
  buy_in: string;
  cash_out: string;
  notes: string;
};

export type FieldErrors = Partial<Record<keyof SessionInput | "venue", string>>;

// Longest real session so far is 15.75h; anything past 18h is almost certainly a typo.
const MAX_HOURS = 18;

/** Checks a submitted session form. Returns one friendly message per problem field. */
export function validateSession(input: SessionInput, today = new Date().toISOString().slice(0, 10)): FieldErrors {
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

  for (const key of ["buy_in", "cash_out"] as const) {
    const label = key === "buy_in" ? "buy-in" : "cash-out";
    if (input[key].trim() === "") errors[key] = `Enter your ${label} (0 is fine).`;
    else if (!Number.isFinite(Number(input[key])) || Number(input[key]) < 0)
      errors[key] = `The ${label} has to be a number of 0 or more.`;
  }

  return errors;
}
