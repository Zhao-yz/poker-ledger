import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/sessions";
import type { Hand } from "@/lib/hands";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { deleteHand } from "../actions";

export default async function HandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("hands")
    .select("*, sessions(played_on, venues(name))")
    .eq("id", Number(id))
    .maybeSingle();
  if (!data) notFound();
  const h = data as Hand;

  return (
    <section className="space-y-4">
      <Link href={`/sessions/${h.session_id}`} className="text-sm text-muted hover:text-foreground">
        ← {h.sessions?.played_on} · {h.sessions?.venues?.name}
      </Link>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm text-muted">
              {[h.hole_cards, h.position].filter(Boolean).join(" · ") || "No cards recorded"}
            </p>
            <h1 className="mt-1 text-xl font-semibold">{h.title}</h1>
          </div>
          {h.result != null && (
            <p className={`text-2xl font-semibold ${Number(h.result) >= 0 ? "text-win" : "text-loss"}`}>
              {formatMoney(Number(h.result))}
            </p>
          )}
        </div>
        {h.notes && <p className="mt-6 whitespace-pre-wrap text-sm">{h.notes}</p>}
        <div className="mt-6 flex gap-3">
          <Link href={`/hands/${h.id}/edit`} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-background">
            Edit
          </Link>
          <ConfirmDelete message="Are you sure? This deletes the hand." action={deleteHand.bind(null, h.id, h.session_id)} />
        </div>
      </div>
    </section>
  );
}
