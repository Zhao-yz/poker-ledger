import { createClient } from "@/lib/supabase/server";

/** The ids of hands the logged-in user has starred (RLS limits the query to their own stars). */
export async function starredHandIds(): Promise<Set<number>> {
  const supabase = await createClient();
  const { data } = await supabase.from("stars").select("hand_id");
  return new Set((data ?? []).map((r) => r.hand_id as number));
}
