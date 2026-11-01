"use client";

import { useState, useTransition } from "react";
import { deleteSession } from "../actions";

export function DeleteSessionButton({ id }: { id: number }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-md border border-loss/50 px-4 py-2 text-sm text-loss hover:bg-loss/10"
      >
        Delete
      </button>
    );
  }

  return (
    <div role="alertdialog" className="flex items-center gap-3 rounded-md border border-loss/50 bg-loss/10 px-3 py-2 text-sm">
      <span>Are you sure? This also deletes the session&apos;s hands.</span>
      <button
        disabled={pending}
        onClick={() => startTransition(() => deleteSession(id))}
        className="rounded-md bg-loss px-3 py-1 font-medium text-white disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button onClick={() => setConfirming(false)} className="rounded-md border border-border px-3 py-1">
        Cancel
      </button>
    </div>
  );
}
