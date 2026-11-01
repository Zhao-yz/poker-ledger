# Prompt log: sessions create / list / detail / edit / delete (#7)

Agent: Claude Code (Claude Opus 5.5), 2026-11-01.

## Prompt

Continuing "start as planned" (PLAN.md feature 3).

## What the agent built

- `/sessions`: my sessions, newest first, each row showing date, venue, start–end time, hours and net (green win, red loss).
- `/sessions/new` and `/sessions/[id]/edit`: one shared form. Venue is a dropdown of my venues, or I can type a new venue name and it gets created.
- `/sessions/[id]`: detail page with buy-in, cash-out, hourly rate and notes, plus Edit and Delete.
- Delete asks "Are you sure? This also deletes the session's hands." before doing anything.
- `src/lib/sessions.ts`: net = cash-out − buy-in; hours = end − start, adding 24 hours when a session runs past midnight (most of my sessions end after midnight).
- The home page sends you to the session list until the dashboard exists.

## Checks

Typecheck, lint and production build pass. Not yet clicked through against a real database.
