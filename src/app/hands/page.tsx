import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Hand } from "@/lib/hands";
import { starredHandIds } from "@/lib/stars";
import { HandList } from "./HandList";

const SORTS = { newest: "Newest first", biggest_win: "Biggest win", biggest_loss: "Biggest loss" } as const;

export default async function HandsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const sort = (sp.sort ?? "newest") in SORTS ? (sp.sort as keyof typeof SORTS) : "newest";

  const supabase = await createClient();
  let query = supabase.from("hands").select("*, sessions(played_on, venues(name))");
  if (q) {
    // Match the text anywhere in the cards, title or review notes. Commas and parentheses would break the filter syntax.
    const term = q.replace(/[,()]/g, " ");
    query = query.or(`hole_cards.ilike.%${term}%,title.ilike.%${term}%,notes.ilike.%${term}%`);
  }
  if (sort === "biggest_win") query = query.order("result", { ascending: false, nullsFirst: false });
  else if (sort === "biggest_loss") query = query.order("result", { ascending: true, nullsFirst: false });
  else query = query.order("created_at", { ascending: false });

  const [{ data }, starred] = await Promise.all([query, starredHandIds()]);
  const hands = (data ?? []) as Hand[];

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">All hands</h1>
      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3 text-sm">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-muted">Search cards, titles and notes</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="TT, 3-bet, river…"
            className="rounded-md border border-border bg-background px-2 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Sort</span>
          <select name="sort" defaultValue={sort} className="rounded-md border border-border bg-background px-2 py-1.5">
            {Object.entries(SORTS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-md bg-felt-bright px-3 py-1.5 font-medium text-white hover:bg-felt">Search</button>
        {q && (
          <Link href="/hands" className="py-1.5 text-muted hover:text-foreground">
            Clear
          </Link>
        )}
      </form>
      <HandList
        hands={hands}
        starred={starred}
        showSession
        emptyText={q ? `No hands match "${q}".` : "No hands yet. Add them from a session page."}
      />
    </section>
  );
}
