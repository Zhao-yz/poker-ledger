"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateHand, type HandErrors, type HandInput } from "@/lib/hands";

export type HandFormState = { error?: string; fieldErrors?: HandErrors; values?: HandInput; saved?: number };

function readInput(formData: FormData): HandInput {
  const f = (name: string) => String(formData.get(name) ?? "").trim();
  return { hole_cards: f("hole_cards"), position: f("position"), title: f("title"), result: f("result"), notes: f("notes") };
}

function toRow(input: HandInput) {
  return {
    hole_cards: input.hole_cards || null,
    position: input.position || null,
    title: input.title,
    result: input.result === "" ? null : Number(input.result),
    notes: input.notes || null,
  };
}

export async function addHand(sessionId: number, prev: HandFormState, formData: FormData): Promise<HandFormState> {
  const input = readInput(formData);
  const fieldErrors = validateHand(input);
  if (Object.keys(fieldErrors).length > 0) return { error: "Fix the highlighted fields.", fieldErrors, values: input };
  const supabase = await createClient();
  const { error } = await supabase.from("hands").insert({ ...toRow(input), session_id: sessionId });
  if (error) return { error: "Couldn't save the hand. Try again.", values: input };
  revalidatePath(`/sessions/${sessionId}`);
  // `saved` changes on every success so the form clears itself for the next hand.
  return { saved: (prev.saved ?? 0) + 1 };
}

export async function updateHand(id: number, _prev: HandFormState, formData: FormData): Promise<HandFormState> {
  const input = readInput(formData);
  const fieldErrors = validateHand(input);
  if (Object.keys(fieldErrors).length > 0) return { error: "Fix the highlighted fields.", fieldErrors, values: input };
  const supabase = await createClient();
  const { error } = await supabase.from("hands").update(toRow(input)).eq("id", id);
  if (error) return { error: "Couldn't save the hand. Try again.", values: input };
  revalidatePath(`/hands/${id}`);
  redirect(`/hands/${id}`);
}

export async function deleteHand(id: number, sessionId: number) {
  const supabase = await createClient();
  await supabase.from("hands").delete().eq("id", id);
  revalidatePath(`/sessions/${sessionId}`);
  redirect(`/sessions/${sessionId}`);
}
