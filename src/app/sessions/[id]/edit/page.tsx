import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Session, Venue } from "@/lib/sessions";
import { updateSession } from "../../actions";
import { SessionForm } from "../../SessionForm";

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: session }, { data: venues }] = await Promise.all([
    supabase.from("sessions").select("*").eq("id", Number(id)).maybeSingle(),
    supabase.from("venues").select("id, name, city").order("name"),
  ]);
  if (!session) notFound();
  const s = session as Session;

  return (
    <section>
      <h1 className="mb-4 text-xl font-semibold">Edit session</h1>
      <SessionForm
        venues={(venues ?? []) as Venue[]}
        session={s}
        action={updateSession.bind(null, s.id)}
        submitLabel="Save changes"
        cancelHref={`/sessions/${s.id}`}
      />
    </section>
  );
}
