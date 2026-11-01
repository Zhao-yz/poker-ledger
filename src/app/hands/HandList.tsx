import Link from "next/link";
import { formatMoney } from "@/lib/sessions";
import type { Hand } from "@/lib/hands";
import { StarButton } from "../stars/StarButton";

type Props = { hands: Hand[]; starred: Set<number>; showSession?: boolean; emptyText?: string };

// One row per hand: star, cards and position, title, result. Used on session pages and the Starred page.
export function HandList({ hands, starred, showSession = false, emptyText = "No hands yet." }: Props) {
  if (hands.length === 0) {
    return <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">{emptyText}</p>;
  }
  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {hands.map((h) => (
        <li key={h.id} className="flex items-center gap-3 pl-4">
          <StarButton handId={h.id} starred={starred.has(h.id)} />
          <Link href={`/hands/${h.id}`} className="flex flex-1 items-center gap-4 py-3 pr-4 hover:bg-background">
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
