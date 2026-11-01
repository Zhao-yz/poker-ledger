import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Hand } from "@/lib/hands";
import { updateHand } from "../../actions";
import { HandForm } from "../../HandForm";

export default async function EditHandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("hands").select("*").eq("id", Number(id)).maybeSingle();
  if (!data) notFound();
  const h = data as Hand;

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h1 className="mb-4 text-xl font-semibold">Edit hand</h1>
      <HandForm hand={h} action={updateHand.bind(null, h.id)} submitLabel="Save changes" />
    </section>
  );
}
