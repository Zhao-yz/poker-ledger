import { validateSession, type SessionInput } from "./validation";

// Columns the importer understands. Header names are matched case-insensitively.
export const CSV_COLUMNS = ["date", "venue", "start", "end", "net", "buy_in", "cash_out", "stakes", "notes"] as const;

export type CsvRow = Partial<Record<(typeof CSV_COLUMNS)[number], string>>;
export type CheckedRow = { line: number; input: SessionInput; venue: string; errors: string[] };

/** Accepts 24-hour "14:30", or "2pm" / "11:30am" as written in my notes. Returns "HH:MM" or "" if unreadable. */
export function normalizeTime(raw: string): string {
  const t = raw.trim().toLowerCase().replace(/^~/, "");
  let m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;
  m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (!m) return "";
  let h = Number(m[1]) % 12;
  if (m[3] === "pm") h += 12;
  return `${String(h).padStart(2, "0")}:${m[2] ?? "00"}`;
}

/** Turns parsed CSV records into session inputs and checks each one with the same rules as the form. */
export function checkRows(rows: CsvRow[], today?: string): CheckedRow[] {
  return rows.map((r, i) => {
    const venue = (r.venue ?? "").trim();
    const input: SessionInput = {
      played_on: (r.date ?? "").trim(),
      venue_id: "",
      new_venue: venue,
      start_time: normalizeTime(r.start ?? ""),
      end_time: normalizeTime(r.end ?? ""),
      stakes: (r.stakes ?? "").trim(),
      net: (r.net ?? "").trim(),
      buy_in: (r.buy_in ?? "").trim(),
      cash_out: (r.cash_out ?? "").trim(),
      notes: (r.notes ?? "").trim(),
    };
    const errors = Object.values(validateSession(input, today)).filter(Boolean) as string[];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.played_on)) errors.unshift("Date must look like 2026-10-30.");
    return { line: i + 2, input, venue, errors }; // +2: header is line 1
  });
}
