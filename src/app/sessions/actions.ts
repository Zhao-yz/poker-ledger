"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SessionFormState = { error?: string };

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

// Uses the venue picked in the dropdown, or creates one from the "new venue" box.
async function resolveVenueId(formData: FormData): Promise<number | null> {
  const supabase = await createClient();
  const newVenue = field(formData, "new_venue");
  if (newVenue) {
    const { data: existing } = await supabase.from("venues").select("id").eq("name", newVenue).maybeSingle();
    if (existing) return existing.id;
    const { data, error } = await supabase.from("venues").insert({ name: newVenue }).select("id").single();
    if (error) throw error;
    return data.id;
  }
  const picked = Number(field(formData, "venue_id"));
  return Number.isFinite(picked) && picked > 0 ? picked : null;
}

function readSession(formData: FormData, venueId: number | null) {
  return {
    venue_id: venueId,
    played_on: field(formData, "played_on"),
    start_time: field(formData, "start_time"),
    end_time: field(formData, "end_time"),
    stakes: field(formData, "stakes") || null,
    buy_in: Number(field(formData, "buy_in")),
    cash_out: Number(field(formData, "cash_out")),
    notes: field(formData, "notes") || null,
  };
}

export async function createSession(_prev: SessionFormState, formData: FormData): Promise<SessionFormState> {
  const supabase = await createClient();
  const venueId = await resolveVenueId(formData);
  const { data, error } = await supabase
    .from("sessions")
    .insert(readSession(formData, venueId))
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/sessions");
  redirect(`/sessions/${data.id}`);
}

export async function updateSession(
  id: number,
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const supabase = await createClient();
  const venueId = await resolveVenueId(formData);
  const { error } = await supabase.from("sessions").update(readSession(formData, venueId)).eq("id", id);
  if (error) return { error: error.message };
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
