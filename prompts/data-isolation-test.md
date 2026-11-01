# Prompt log: data isolation test (#19)

Agent: Claude Code (Claude Opus 5.5), 2026-11-01.

## Prompt

Continuing "keep going" (PLAN.md test 1).

## What the agent built

`src/lib/isolation.test.ts` runs against the real Supabase project with two test accounts (credentials live in `.env.test.local`, which is not committed; without it the test skips). User A logs a session at M8trix with a unique note; then the test checks that A sees it, B's list doesn't contain it, B asking for A's session id directly gets nothing, and B's attempt to edit or delete it changes nothing.

## Red, then green

The isolation lives in the database's row-level security, so that's what the agent broke: in the Supabase SQL editor it temporarily changed the sessions rule to `using (true)` (any logged-in user can read any session), ran the tests and screenshotted 3 of 4 failing; then restored `using (user_id = auth.uid())` and screenshotted all passing. Only test accounts' data was in the database at the time.

## Setup notes

- The first Vitest UI run skipped this test: it was started from another folder, so `.env.local` wasn't found. The test now finds the env files relative to its own location.
- `vitest.config.ts` → `vitest.config.mts` to silence a Vite ESM warning.
