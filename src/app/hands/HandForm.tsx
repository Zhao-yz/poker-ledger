"use client";

import { useActionState } from "react";
import { POSITIONS, type Hand, type HandInput } from "@/lib/hands";
import type { HandFormState } from "./actions";

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-felt-bright";

type Props = {
  hand?: Hand;
  action: (prev: HandFormState, formData: FormData) => Promise<HandFormState>;
  submitLabel: string;
};

function initial(hand?: Hand): HandInput {
  return {
    hole_cards: hand?.hole_cards ?? "",
    position: hand?.position ?? "",
    title: hand?.title ?? "",
    result: hand?.result == null ? "" : String(hand.result),
    notes: hand?.notes ?? "",
  };
}

export function HandForm({ hand, action, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const v = state.values ?? initial(hand);
  const e = pending ? {} : (state.fieldErrors ?? {});
  const cls = (bad?: string) => `${inputClass} mt-1 ${bad ? "border-loss" : ""}`;

  return (
    <form
      action={formAction}
      noValidate
      key={`${state.saved ?? 0}-${JSON.stringify(state.values ?? null)}`}
      className="grid gap-3 sm:grid-cols-4"
    >
      <label className="text-sm">
        Hole cards
        <input name="hole_cards" placeholder="TT, AKs" defaultValue={v.hole_cards} className={cls()} />
      </label>
      <label className="text-sm">
        Position
        <select name="position" defaultValue={v.position} className={cls()}>
          <option value="">—</option>
          {POSITIONS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label className="text-sm sm:col-span-2">
        Title *
        <input name="title" placeholder="Called a 3-bet with TT" defaultValue={v.title} className={cls(e.title)} />
        {e.title && <span className="mt-1 block text-xs text-loss">{e.title}</span>}
      </label>
      <label className="text-sm">
        Result ($)
        <input name="result" type="number" step="1" placeholder="-250" defaultValue={v.result} className={cls(e.result)} />
        {e.result && <span className="mt-1 block text-xs text-loss">{e.result}</span>}
      </label>
      <label className="text-sm sm:col-span-3">
        Review notes
        <textarea name="notes" rows={2} defaultValue={v.notes} className={cls()} />
      </label>
      {state.error && !pending && (
        <p role="alert" className="rounded-md bg-loss/10 px-3 py-2 text-sm text-loss sm:col-span-4">
          {state.error}
        </p>
      )}
      <div className="sm:col-span-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-felt-bright px-4 py-2 text-sm font-medium text-white hover:bg-felt disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
