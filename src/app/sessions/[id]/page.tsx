import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, formatTime, sessionHours, sessionNet, type Session } from "@/lib/sessions";
import { DeleteSessionButton } from "./DeleteSessionButton";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // Row-level security returns nothing for another user's session, so it shows as not found.
  const { data } = await supabase.from("sessions").select("*, venues(name)").eq("id", Number(id)).maybeSingle();
  if (!data) notFound();
  const s = data as Session;
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
          <DeleteSessionButton id={s.id} />
        </div>
      </div>
    </section>
  );
}
