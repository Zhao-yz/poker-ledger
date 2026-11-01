import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { filterAndSort, SORTS, type SessionFilters, type SortKey } from "@/lib/find";
import { formatMoney, formatTime, sessionHours, sessionNet, type Session, type Venue } from "@/lib/sessions";

const field = "rounded-md border border-border bg-background px-2 py-1.5 text-sm";

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const f: SessionFilters = {
    venue: sp.venue ?? "",
    from: sp.from ?? "",
    to: sp.to ?? "",
    result: (sp.result as SessionFilters["result"]) ?? "",
    sort: (sp.sort as SortKey) in SORTS ? (sp.sort as SortKey) : "newest",
  };

  const supabase = await createClient();
  let query = supabase.from("sessions").select("*, venues(name)");
  if (f.venue) query = query.eq("venue_id", Number(f.venue));
  if (f.from) query = query.gte("played_on", f.from);
  if (f.to) query = query.lte("played_on", f.to);
  const [{ data }, { data: venueRows }, { count: total }] = await Promise.all([
    query,
    supabase.from("venues").select("id, name, city").order("name"),
    supabase.from("sessions").select("id", { count: "exact", head: true }),
  ]);
  const sessions = filterAndSort((data ?? []) as Session[], f);
  const venues = (venueRows ?? []) as Venue[];
  const filtered = Boolean(f.venue || f.from || f.to || f.result);
  const net = sessions.reduce((sum, s) => sum + sessionNet(s), 0);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sessions</h1>
        <Link href="/sessions/new" className="rounded-md bg-felt-bright px-4 py-2 text-sm font-medium text-white hover:bg-felt">
          + New session
        </Link>
      </div>

      {(total ?? 0) > 0 && (
        <form className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Venue</span>
            <select name="venue" defaultValue={f.venue} className={field}>
              <option value="">All venues</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">From</span>
            <input type="date" name="from" defaultValue={f.from} className={field} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">To</span>
            <input type="date" name="to" defaultValue={f.to} className={field} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Result</span>
            <select name="result" defaultValue={f.result} className={field}>
              <option value="">Wins and losses</option>
              <option value="win">Wins only</option>
              <option value="loss">Losses only</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Sort</span>
            <select name="sort" defaultValue={f.sort} className={field}>
              {Object.entries(SORTS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button className="rounded-md bg-felt-bright px-3 py-1.5 font-medium text-white hover:bg-felt">Apply</button>
          {filtered && (
            <Link href="/sessions" className="py-1.5 text-muted hover:text-foreground">
              Clear
            </Link>
          )}
        </form>
      )}

      {(total ?? 0) === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          No sessions yet. Log your first one.
        </p>
      ) : sessions.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          No sessions match these filters.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted">
            {sessions.length} session{sessions.length === 1 ? "" : "s"} · net{" "}
            <span className={net >= 0 ? "text-win" : "text-loss"}>{formatMoney(net)}</span>
          </p>
          <ul className="mt-2 divide-y divide-border rounded-xl border border-border bg-card">
            {sessions.map((s) => {
              const sNet = sessionNet(s);
              const hours = sessionHours(s.start_time, s.end_time);
              return (
                <li key={s.id}>
                  <Link href={`/sessions/${s.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-background">
                    <span className="w-24 text-sm text-muted">{s.played_on}</span>
                    <span className="flex-1 font-medium">{s.venues?.name ?? "—"}</span>
                    <span className="hidden text-sm text-muted sm:inline">
                      {formatTime(s.start_time)}–{formatTime(s.end_time)} · {hours.toFixed(1)}h
                    </span>
                    <span className="hidden w-20 text-right text-xs text-muted sm:inline">
                      {formatMoney(sNet / hours)}/h
                    </span>
                    <span className={`w-24 text-right font-semibold ${sNet >= 0 ? "text-win" : "text-loss"}`}>
                      {formatMoney(sNet)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
