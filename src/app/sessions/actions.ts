"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveNet, validateSession, type FieldErrors, type SessionInput } from "@/lib/validation";

// `values` echoes what was typed, so a rejected form keeps the user's input.
export type SessionFormState = { error?: string; fieldErrors?: FieldErrors; values?: SessionInput };

function readInput(formData: FormData): SessionInput {
  const f = (name: string) => String(formData.get(name) ?? "").trim();
  return {
    played_on: f("played_on"),
    venue_id: f("venue_id"),
    new_venue: f("new_venue"),
    start_time: f("start_time"),
    end_time: f("end_time"),
    stakes: f("stakes"),
    net: f("net"),
    buy_in: f("buy_in"),
    cash_out: f("cash_out"),
    notes: f("notes"),
  };
}

// Uses the venue picked in the dropdown, or creates one from the "new venue" box.
async function resolveVenueId(input: SessionInput): Promise<number> {
  const supabase = await createClient();
  if (input.new_venue) {
    const { data: existing } = await supabase.from("venues").select("id").eq("name", input.new_venue).maybeSingle();
    if (existing) return existing.id;
    const { data, error } = await supabase.from("venues").insert({ name: input.new_venue }).select("id").single();
    if (error) throw error;
    return data.id;
  }
  return Number(input.venue_id);
}

function toRow(input: SessionInput, venueId: number) {
  return {
    venue_id: venueId,
    played_on: input.played_on,
    start_time: input.start_time,
    end_time: input.end_time,
    stakes: input.stakes || null,
    net: resolveNet(input),
    buy_in: input.buy_in === "" ? null : Number(input.buy_in),
    cash_out: input.cash_out === "" ? null : Number(input.cash_out),
    notes: input.notes || null,
  };
}

async function checkAndSave(
  formData: FormData,
  save: (row: ReturnType<typeof toRow>) => Promise<{ id?: number; error?: string }>,
): Promise<SessionFormState | { id: number }> {
  const input = readInput(formData);
  const fieldErrors = validateSession(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Fix the highlighted fields and save again.", fieldErrors, values: input };
  }
  const result = await save(toRow(input, await resolveVenueId(input)));
  if (result.error || !result.id) return { error: "Couldn't save the session. Try again.", values: input };
  return { id: result.id };
}

export async function createSession(_prev: SessionFormState, formData: FormData): Promise<SessionFormState> {
  const supabase = await createClient();
  const out = await checkAndSave(formData, async (row) => {
    const { data, error } = await supabase.from("sessions").insert(row).select("id").single();
    return { id: data?.id, error: error?.message };
  });
  if (!("id" in out)) return out;
  revalidatePath("/sessions");
  redirect(`/sessions/${out.id}`);
}

export async function updateSession(
  id: number,
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const supabase = await createClient();
  const out = await checkAndSave(formData, async (row) => {
    const { error } = await supabase.from("sessions").update(row).eq("id", id);
    return { id, error: error?.message };
  });
  if (!("id" in out)) return out;
  revalidatePath("/sessions");
  revalidatePath(`/sessions/${id}`);
  redirect(`/sessions/${id}`);
}

export async function deleteSession(id: number) {
  const supabase = await createClient();
  await supabase.from("sessions").delete().eq("id", id);
  revalidatePath("/sessions");
  redirect("/sessions");
}
