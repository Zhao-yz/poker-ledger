import { sessionHours, sessionNet, type Session } from "./sessions";

type StatSession = Pick<Session, "played_on" | "start_time" | "end_time" | "net">;

export type DashboardStats = {
  sessions: number;
  totalNet: number;
  totalHours: number;
  /** Total net ÷ total hours. Not the average of each session's own hourly rate. */
  hourly: number;
  /** Share of sessions with a positive net, 0 to 1. */
  winRate: number;
  bestMonth: { month: string; net: number } | null;
  cumulative: { date: string; net: number; cumulative: number }[];
  byMonth: { month: string; net: number; hours: number }[];
  /** Sessions that started before EARLY_CUTOFF vs. at or after it. */
  byStart: { early: Bucket; late: Bucket };
};

export type Bucket = { sessions: number; net: number; hours: number; hourly: number };

// My own split: sitting down before 3pm counts as an early session.
export const EARLY_CUTOFF = "15:00";

export function computeStats(input: StatSession[]): DashboardStats {
  const sessions = [...input].sort(
    (a, b) => a.played_on.localeCompare(b.played_on) || a.start_time.localeCompare(b.start_time),
  );
  let totalNet = 0;
  let totalHours = 0;
  let wins = 0;
  const cumulative: DashboardStats["cumulative"] = [];
  const months = new Map<string, { net: number; hours: number }>();
  const early = { sessions: 0, net: 0, hours: 0 };
  const late = { sessions: 0, net: 0, hours: 0 };

  for (const s of sessions) {
    const net = sessionNet(s);
    const hours = sessionHours(s.start_time, s.end_time);
    totalNet += net;
    totalHours += hours;
    if (net > 0) wins += 1;
    cumulative.push({ date: s.played_on, net, cumulative: totalNet });
    const key = s.played_on.slice(0, 7);
    const m = months.get(key) ?? { net: 0, hours: 0 };
    m.net += net;
    m.hours += hours;
    months.set(key, m);
    const b = s.start_time.slice(0, 5) < EARLY_CUTOFF ? early : late;
    b.sessions += 1;
    b.net += net;
    b.hours += hours;
  }
  const bucket = (b: typeof early): Bucket => ({ ...b, hourly: b.hours > 0 ? b.net / b.hours : 0 });

  const byMonth = [...months.entries()].map(([month, m]) => ({ month, ...m }));
  const bestMonth = byMonth.reduce<DashboardStats["bestMonth"]>(
    (best, m) => (best === null || m.net > best.net ? { month: m.month, net: m.net } : best),
    null,
  );

  return {
    sessions: sessions.length,
    totalNet,
    totalHours,
    hourly: totalHours > 0 ? totalNet / totalHours : 0,
    winRate: sessions.length > 0 ? wins / sessions.length : 0,
    bestMonth,
    cumulative,
    byMonth,
    byStart: { early: bucket(early), late: bucket(late) },
  };
}
