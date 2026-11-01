# Prompt log: find things (#15)

Agent: Claude Code (Claude Opus 5.5), 2026-11-01.

## Prompt

Continuing "keep going" (PLAN.md feature 7).

## What the agent built

- Sessions page filter bar: venue, date range (from / to), wins only / losses only, and sort by newest, oldest, biggest win, biggest loss or best hourly rate. Filters live in the URL, so a filtered view can be bookmarked. A line above the list shows the count and net of what's on screen.
- Venue and dates are filtered in the database query; win/loss and the sorts that depend on computed net and hourly run in `src/lib/find.ts`.
- New "Hands" page: search hole cards, titles and notes (case-insensitive, so "tt" finds TT), sort by newest, biggest win or biggest loss. "Hands" is in the nav.
- Each session row now also shows its hourly rate.

## Checks

Typecheck and lint pass. Locally: wins-only shows "No sessions match these filters" for an account with only a losing session; losses + M8trix + best hourly shows it; searching "tt" finds the TT hand; "river" finds nothing.
