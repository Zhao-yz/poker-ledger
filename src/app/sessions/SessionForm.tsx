"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { todayInAppZone } from "@/lib/dates";
import type { Session, Venue } from "@/lib/sessions";
import { workedOutNet, type FieldErrors, type SessionInput } from "@/lib/validation";
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

function initialValues(session?: Session): SessionInput {
  return {
    played_on: session?.played_on ?? todayInAppZone(),
    venue_id: session ? String(session.venue_id) : "",
    new_venue: "",
    start_time: session?.start_time?.slice(0, 5) ?? "",
    end_time: session?.end_time?.slice(0, 5) ?? "",
    stakes: session?.stakes ?? "",
    net: session ? String(session.net) : "",
    buy_in: session?.buy_in == null ? "" : String(session.buy_in),
    cash_out: session?.cash_out == null ? "" : String(session.cash_out),
    notes: session?.notes ?? "",
  };
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="mt-1 block text-xs text-loss">{message}</span> : null;
}

// Net follows buy-in and cash-out as you type, so correcting one number can't leave it out of date.
function AmountFields({ v, e, cls }: { v: SessionInput; e: FieldErrors; cls: (bad?: string) => string }) {
  const [buyIn, setBuyIn] = useState(v.buy_in);
  const [cashOut, setCashOut] = useState(v.cash_out);
  const [typedNet, setTypedNet] = useState(v.net);
  const worked = workedOutNet(buyIn, cashOut);

  return (
    <>
      <label className="text-sm sm:col-span-2">
        Net result ($) *{" "}
        <span className="text-muted">
          {worked === null
            ? "(e.g. -1400 or 2700; or fill in buy-in and cash-out below)"
            : "(worked out from buy-in and cash-out)"}
        </span>
        <input
          name="net"
          type="number"
          step="1"
          value={worked ?? typedNet}
          readOnly={worked !== null}
          onChange={(event) => setTypedNet(event.target.value)}
          className={cls(e.net)}
        />
        <FieldError message={e.net} />
      </label>
      <label className="text-sm">
        Buy-in ($) <span className="text-muted">(optional)</span>
        <input
          name="buy_in"
          type="number"
          min="0"
          step="1"
          value={buyIn}
          onChange={(event) => setBuyIn(event.target.value)}
          className={cls(e.buy_in)}
        />
        <FieldError message={e.buy_in} />
      </label>
      <label className="text-sm">
        Cash-out ($) <span className="text-muted">(optional)</span>
        <input
          name="cash_out"
          type="number"
          min="0"
          step="1"
          value={cashOut}
          onChange={(event) => setCashOut(event.target.value)}
          className={cls(e.cash_out)}
        />
        <FieldError message={e.cash_out} />
      </label>
    </>
  );
}

export function SessionForm({ venues, session, action, submitLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  // After a rejected save, show what the user typed rather than the original values.
  const v = state.values ?? initialValues(session);
  // Hide the previous round's errors while a new save is in flight.
  const e = pending ? {} : (state.fieldErrors ?? {});
  const cls = (bad?: string) => `${inputClass} mt-1 ${bad ? "border-loss" : ""}`;

  return (
    <form
      action={formAction}
      noValidate
      // Remount the inputs after each response so defaultValue picks up the echoed values.
      key={JSON.stringify(state.values ?? null)}
      className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2"
    >
      <label className="text-sm">
        Date *
        <input name="played_on" type="date" defaultValue={v.played_on} className={cls(e.played_on)} />
        <FieldError message={e.played_on} />
      </label>
      <label className="text-sm">
        Stakes
        <input name="stakes" placeholder="2/3/5" defaultValue={v.stakes} className={cls()} />
      </label>
      <label className="text-sm">
        Venue *
        <select name="venue_id" defaultValue={v.venue_id} className={cls(e.venue)}>
          <option value="">Choose a venue…</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
        <FieldError message={e.venue} />
      </label>
      <label className="text-sm">
        …or add a new venue
        <input name="new_venue" placeholder="e.g. M8trix" defaultValue={v.new_venue} className={cls(e.venue)} />
      </label>
      <label className="text-sm">
        Start time *
        <input name="start_time" type="time" defaultValue={v.start_time} className={cls(e.start_time)} />
        <FieldError message={e.start_time} />
      </label>
      <label className="text-sm">
        End time * <span className="text-muted">(past midnight is fine)</span>
        <input name="end_time" type="time" defaultValue={v.end_time} className={cls(e.end_time)} />
        <FieldError message={e.end_time} />
      </label>
      <AmountFields v={v} e={e} cls={cls} />
      <label className="text-sm sm:col-span-2">
        Notes
        <textarea name="notes" rows={3} defaultValue={v.notes} className={cls()} />
      </label>
      {state.error && !pending && (
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
