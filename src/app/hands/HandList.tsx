import Link from "next/link";
import { formatMoney } from "@/lib/sessions";
import type { Hand } from "@/lib/hands";

// One row per hand: cards and position, title, result. Used on a session page and later on the starred page.
export function HandList({ hands, showSession = false }: { hands: Hand[]; showSession?: boolean }) {
  if (hands.length === 0) {
    return <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">No hands yet.</p>;
  }
  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {hands.map((h) => (
        <li key={h.id}>
          <Link href={`/hands/${h.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-background">
            <span className="w-20 font-mono text-sm">{h.hole_cards ?? "—"}</span>
            <span className="w-12 text-xs text-muted">{h.position ?? ""}</span>
            <span className="flex-1">
              {h.title}
              {showSession && h.sessions && (
                <span className="ml-2 text-xs text-muted">
                  {h.sessions.played_on} · {h.sessions.venues?.name}
                </span>
              )}
            </span>
            {h.result != null && (
              <span className={`w-20 text-right text-sm font-semibold ${Number(h.result) >= 0 ? "text-win" : "text-loss"}`}>
                {formatMoney(Number(h.result))}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
