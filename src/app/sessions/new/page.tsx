import { createClient } from "@/lib/supabase/server";
import type { Venue } from "@/lib/sessions";
import { createSession } from "../actions";
import { SessionForm } from "../SessionForm";

export default async function NewSessionPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("venues").select("id, name, city").order("name");

  return (
    <section>
      <h1 className="mb-4 text-xl font-semibold">New session</h1>
      <SessionForm venues={(data ?? []) as Venue[]} action={createSession} submitLabel="Save session" cancelHref="/sessions" />
    </section>
  );
}
