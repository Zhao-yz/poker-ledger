import { sessionHours, sessionNet, type Session } from "./sessions";

export type SessionFilters = {
  venue?: string; // venue id
  from?: string; // YYYY-MM-DD
  to?: string;
  result?: "win" | "loss" | "";
  sort?: SortKey;
};

export const SORTS = {
  newest: "Newest first",
  oldest: "Oldest first",
  biggest_win: "Biggest win",
  biggest_loss: "Biggest loss",
  best_hourly: "Best hourly rate",
} as const;
export type SortKey = keyof typeof SORTS;

/** Filters by result and sorts. Venue and date filters run in the database query. */
export function filterAndSort(sessions: Session[], f: SessionFilters): Session[] {
  let out = sessions;
  if (f.result === "win") out = out.filter((s) => sessionNet(s) > 0);
  if (f.result === "loss") out = out.filter((s) => sessionNet(s) < 0);

  const hourly = (s: Session) => sessionNet(s) / sessionHours(s.start_time, s.end_time);
  const byDate = (a: Session, b: Session) =>
    a.played_on.localeCompare(b.played_on) || a.start_time.localeCompare(b.start_time);
  const sorters: Record<SortKey, (a: Session, b: Session) => number> = {
    newest: (a, b) => byDate(b, a),
    oldest: byDate,
    biggest_win: (a, b) => sessionNet(b) - sessionNet(a),
    biggest_loss: (a, b) => sessionNet(a) - sessionNet(b),
    best_hourly: (a, b) => hourly(b) - hourly(a),
  };
  return [...out].sort(sorters[f.sort ?? "newest"] ?? sorters.newest);
}
