"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "./actions";

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-felt-bright";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    isSignup ? signup : login,
    {},
  );

  return (
    <div className="mx-auto mt-16 w-full max-w-sm rounded-xl border border-border bg-card p-6">
      <h1 className="text-xl font-semibold">{isSignup ? "Create your account" : "Log in"}</h1>
      <p className="mt-1 text-sm text-muted">
        {isSignup ? "Your sessions are visible only to you." : "Welcome back to Poker Ledger."}
      </p>
      <form action={formAction} className="mt-6 space-y-4">
        {isSignup && (
          <label className="block text-sm">
            Name (optional)
            <input name="display_name" className={`${inputClass} mt-1`} autoComplete="nickname" />
          </label>
        )}
        <label className="block text-sm">
          Email
          <input name="email" type="email" className={`${inputClass} mt-1`} autoComplete="email" />
        </label>
        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            className={`${inputClass} mt-1`}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
        </label>
        {state.error && (
          <p role="alert" className="rounded-md bg-loss/10 px-3 py-2 text-sm text-loss">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-felt-bright px-3 py-2 text-sm font-medium text-white hover:bg-felt disabled:opacity-60"
        >
          {pending ? "Working…" : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link href={isSignup ? "/login" : "/signup"} className="text-felt-bright hover:underline">
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
