import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, formatTime, sessionHours, sessionNet, type Session } from "@/lib/sessions";
import type { Hand } from "@/lib/hands";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { deleteSession } from "../actions";
import { addHand } from "../../hands/actions";
import { HandForm } from "../../hands/HandForm";
import { HandList } from "../../hands/HandList";
import { starredHandIds } from "@/lib/stars";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // Row-level security returns nothing for another user's session, so it shows as not found.
  const [{ data }, { data: handRows }, starred] = await Promise.all([
    supabase.from("sessions").select("*, venues(name)").eq("id", Number(id)).maybeSingle(),
    supabase.from("hands").select("*").eq("session_id", Number(id)).order("created_at"),
    starredHandIds(),
  ]);
  if (!data) notFound();
  const s = data as Session;
  const hands = (handRows ?? []) as Hand[];
  const net = sessionNet(s);
  const hours = sessionHours(s.start_time, s.end_time);

  return (
    <section className="space-y-4">
      <Link href="/sessions" className="text-sm text-muted hover:text-foreground">
        ← All sessions
      </Link>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{s.venues?.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {s.played_on} · {formatTime(s.start_time)}–{formatTime(s.end_time)} · {hours.toFixed(1)}h
              {s.stakes ? ` · ${s.stakes}` : ""}
            </p>
          </div>
          <p className={`text-2xl font-semibold ${net >= 0 ? "text-win" : "text-loss"}`}>{formatMoney(net)}</p>
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-muted">Buy-in</dt>
            <dd>${Number(s.buy_in).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-muted">Cash-out</dt>
            <dd>${Number(s.cash_out).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-muted">Hourly</dt>
            <dd>{formatMoney(net / hours)}/h</dd>
          </div>
        </dl>
        {s.notes && <p className="mt-6 whitespace-pre-wrap text-sm">{s.notes}</p>}
        <div className="mt-6 flex gap-3">
          <Link href={`/sessions/${s.id}/edit`} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-background">
            Edit
          </Link>
          <ConfirmDelete
            message="Are you sure? This also deletes the session's hands."
            action={deleteSession.bind(null, s.id)}
          />
        </div>
      </div>

      <h2 className="pt-2 text-lg font-semibold">Hands ({hands.length})</h2>
      <HandList hands={hands} starred={starred} />
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-3 text-sm font-semibold text-muted">Add a hand</h3>
        <HandForm action={addHand.bind(null, s.id)} submitLabel="Add hand" />
      </div>
    </section>
  );
}
