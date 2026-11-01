import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Hand } from "@/lib/hands";
import { HandList } from "../hands/HandList";

export default async function StarredPage({ searchParams }: { searchParams: Promise<{ empty?: string }> }) {
  const { empty } = await searchParams;
  const supabase = await createClient();
  // Start from the stars table and pull each starred hand with its session and venue.
  const { data } = await supabase
    .from("stars")
    .select("created_at, hands(*, sessions(played_on, venues(name)))")
    .order("created_at", { ascending: false });
  const hands = (data ?? []).map((r) => r.hands as unknown as Hand).filter(Boolean);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Starred hands</h1>
          <p className="mt-1 text-sm text-muted">Your study list. Star a hand from any session to add it here.</p>
        </div>
        {hands.length > 0 && (
          <Link
            href="/review/random"
            prefetch={false}
            className="rounded-md bg-felt-bright px-4 py-2 text-sm font-medium text-white hover:bg-felt"
          >
            🎲 Review a random hand
          </Link>
        )}
      </div>
      {empty && hands.length === 0 && (
        <p role="status" className="rounded-md bg-card px-3 py-2 text-sm text-muted">
          Star at least one hand first, then the random pick has something to choose from.
        </p>
      )}
      <HandList
        hands={hands}
        starred={new Set(hands.map((h) => h.id))}
        showSession
        emptyText="No starred hands yet. Tap ☆ next to a hand to save it for review."
      />
    </section>
  );
}
