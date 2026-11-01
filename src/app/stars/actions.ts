"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Adds or removes one row in the shared `stars` junction table: (this user, this hand).
export async function toggleStar(handId: number, starred: boolean) {
  const supabase = await createClient();
  if (starred) {
    await supabase.from("stars").delete().eq("hand_id", handId);
  } else {
    await supabase.from("stars").insert({ hand_id: handId });
  }
  revalidatePath("/", "layout");
}
