"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Session, Venue } from "@/lib/sessions";
import type { SessionFormState } from "./actions";

export const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-felt-bright";

type Props = {
  venues: Venue[];
  session?: Session;
  action: (prev: SessionFormState, formData: FormData) => Promise<SessionFormState>;
  submitLabel: string;
  cancelHref: string;
};

export function SessionForm({ venues, session, action, submitLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
      <label className="text-sm">
        Date
        <input name="played_on" type="date" defaultValue={session?.played_on ?? today} className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm">
        Stakes
        <input name="stakes" placeholder="2/3/5" defaultValue={session?.stakes ?? ""} className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm">
        Venue
        <select name="venue_id" defaultValue={session?.venue_id ?? ""} className={`${inputClass} mt-1`}>
          <option value="">Choose a venue…</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        …or add a new venue
        <input name="new_venue" placeholder="e.g. M8trix" className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm">
        Start time
        <input name="start_time" type="time" defaultValue={session?.start_time?.slice(0, 5) ?? ""} className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm">
        End time <span className="text-muted">(past midnight is fine)</span>
        <input name="end_time" type="time" defaultValue={session?.end_time?.slice(0, 5) ?? ""} className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm">
        Buy-in ($)
        <input name="buy_in" type="number" min="0" step="1" defaultValue={session?.buy_in ?? ""} className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm">
        Cash-out ($)
        <input name="cash_out" type="number" min="0" step="1" defaultValue={session?.cash_out ?? ""} className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm sm:col-span-2">
        Notes
        <textarea name="notes" rows={3} defaultValue={session?.notes ?? ""} className={`${inputClass} mt-1`} />
      </label>
      {state.error && (
        <p role="alert" className="rounded-md bg-loss/10 px-3 py-2 text-sm text-loss sm:col-span-2">
          {state.error}
        </p>
      )}
      <div className="flex gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-felt-bright px-4 py-2 text-sm font-medium text-white hover:bg-felt disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href={cancelHref} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-background">
          Cancel
        </Link>
      </div>
    </form>
  );
}
