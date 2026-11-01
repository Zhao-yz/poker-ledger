import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, formatTime, sessionHours, sessionNet, type Session } from "@/lib/sessions";

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessions")
    .select("*, venues(name)")
    .order("played_on", { ascending: false })
    .order("start_time", { ascending: false });
  const sessions = (data ?? []) as Session[];

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sessions</h1>
        <Link href="/sessions/new" className="rounded-md bg-felt-bright px-4 py-2 text-sm font-medium text-white hover:bg-felt">
          + New session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          No sessions yet. Log your first one.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
          {sessions.map((s) => {
            const net = sessionNet(s);
            const hours = sessionHours(s.start_time, s.end_time);
            return (
              <li key={s.id}>
                <Link href={`/sessions/${s.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-background">
                  <span className="w-24 text-sm text-muted">{s.played_on}</span>
                  <span className="flex-1 font-medium">{s.venues?.name ?? "—"}</span>
                  <span className="hidden text-sm text-muted sm:inline">
                    {formatTime(s.start_time)}–{formatTime(s.end_time)} · {hours.toFixed(1)}h
                  </span>
                  <span className={`w-24 text-right font-semibold ${net >= 0 ? "text-win" : "text-loss"}`}>
                    {formatMoney(net)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
