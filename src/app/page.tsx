import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, type Session } from "@/lib/sessions";
import { computeStats } from "@/lib/stats";
import { CumulativeChart, MonthlyChart } from "./dashboard/Charts";

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "short", year: "numeric" });
}

export default async function Dashboard() {
  const supabase = await createClient();
  const { data } = await supabase.from("sessions").select("played_on, start_time, end_time, buy_in, cash_out");
  const stats = computeStats((data ?? []) as Session[]);

  if (stats.sessions === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border p-10 text-center">
        <h1 className="text-xl font-semibold">Your dashboard is empty</h1>
        <p className="mt-2 text-sm text-muted">Log a session and your running total, hourly rate and best month show up here.</p>
        <Link href="/sessions/new" className="mt-4 inline-block rounded-md bg-felt-bright px-4 py-2 text-sm font-medium text-white hover:bg-felt">
          + Log your first session
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Total net" value={formatMoney(stats.totalNet)} sub={`${stats.sessions} session${stats.sessions === 1 ? "" : "s"}`} />
        <Tile label="Hourly rate" value={`${formatMoney(stats.hourly)}/h`} sub={`${stats.totalHours.toFixed(0)} hours played`} />
        <Tile label="Winning sessions" value={`${Math.round(stats.winRate * 100)}%`} />
        <Tile
          label="Best month"
          value={stats.bestMonth ? formatMoney(stats.bestMonth.net) : "—"}
          sub={stats.bestMonth ? monthLabel(stats.bestMonth.month) : undefined}
        />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold">Running total</h2>
        <CumulativeChart data={stats.cumulative} />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold">Net by month</h2>
        <MonthlyChart data={stats.byMonth} />
      </div>
    </section>
  );
}
