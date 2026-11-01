"use client";

import { useOptimistic, useTransition } from "react";
import { toggleStar } from "./actions";

export function StarButton({ handId, starred }: { handId: number; starred: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(starred);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={optimistic}
      aria-label={optimistic ? "Unstar this hand" : "Star this hand"}
      title={optimistic ? "Unstar" : "Star to review later"}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await toggleStar(handId, optimistic);
        })
      }
      className={`text-xl leading-none ${optimistic ? "text-yellow-400" : "text-muted hover:text-yellow-300"}`}
    >
      {optimistic ? "★" : "☆"}
    </button>
  );
}
