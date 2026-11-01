"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRows, type CsvRow } from "@/lib/csv";
import { resolveNet } from "@/lib/validation";

export type ImportResult = { imported: number; skippedDuplicates: number; rejected: { line: number; errors: string[] }[] };

// Re-checks every row on the server (never trust the browser preview), creates missing venues,
// skips rows that match a session already logged (same date, venue and start time), and inserts the rest.
export async function importSessions(rows: CsvRow[]): Promise<ImportResult> {
  const supabase = await createClient();
  const checked = checkRows(rows);
  const rejected = checked.filter((r) => r.errors.length > 0).map((r) => ({ line: r.line, errors: r.errors }));
  const good = checked.filter((r) => r.errors.length === 0);
  if (good.length === 0) return { imported: 0, skippedDuplicates: 0, rejected };

  const { data: venueRows } = await supabase.from("venues").select("id, name");
  const venueId = new Map((venueRows ?? []).map((v) => [v.name.toLowerCase(), v.id as number]));
  for (const name of new Set(good.map((r) => r.venue))) {
    if (venueId.has(name.toLowerCase())) continue;
    const { data, error } = await supabase.from("venues").insert({ name }).select("id").single();
    if (error) throw error;
    venueId.set(name.toLowerCase(), data.id);
  }

  const { data: existing } = await supabase.from("sessions").select("played_on, venue_id, start_time");
  const seen = new Set((existing ?? []).map((s) => `${s.played_on}|${s.venue_id}|${String(s.start_time).slice(0, 5)}`));

  const toInsert = [];
  let skippedDuplicates = 0;
  for (const r of good) {
    const vid = venueId.get(r.venue.toLowerCase())!;
    const key = `${r.input.played_on}|${vid}|${r.input.start_time}`;
    if (seen.has(key)) {
      skippedDuplicates += 1;
      continue;
    }
    seen.add(key);
    toInsert.push({
      venue_id: vid,
      played_on: r.input.played_on,
      start_time: r.input.start_time,
      end_time: r.input.end_time,
      stakes: r.input.stakes || null,
      net: resolveNet(r.input),
      buy_in: r.input.buy_in === "" ? null : Number(r.input.buy_in),
      cash_out: r.input.cash_out === "" ? null : Number(r.input.cash_out),
      notes: r.input.notes || null,
    });
  }
  if (toInsert.length > 0) {
    const { error } = await supabase.from("sessions").insert(toInsert);
    if (error) throw error;
  }
  revalidatePath("/", "layout");
  return { imported: toInsert.length, skippedDuplicates, rejected };
}
