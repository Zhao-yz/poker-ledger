# Prompt log: stars (#13)

Agent: Claude Code (Claude Opus 5.5), 2026-11-01.

## Prompt

Continuing "keep going" (PLAN.md feature 6).

## What the agent built

- A ☆ / ★ button on every hand row (session page, Starred page) and on the hand detail page. It flips instantly and saves in the background.
- Each click adds or removes one row in the shared `stars` junction table: (user_id, hand_id). Unstarring deletes by hand id; row-level security makes sure it can only touch the current user's own star.
- `/starred` lists my starred hands newest first, each with its session date and venue, and links to the hand. "Starred" is in the top nav.

## Checks

Typecheck and lint pass. Locally against Supabase: starring a hand puts it on /starred; unstarring removes it after a reload.

## Note

The dev server kept serving the old hand list after the edit (hot reload missed the change on Windows); restarting `npm run dev` fixed it. Not an app bug.
