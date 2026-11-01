# Prompt log: data model (#5)

Agent: Claude Code (Claude Opus 5.5), 2026-11-01.

## Prompt

Continuing "start as planned" (PLAN.md section 3 and feature 2).

## What the agent built

- `supabase/migrations/20261101000000_init.sql`: profiles (auto-created on sign-up by a trigger), venues, sessions, hands, stars.
- Row-level security on every table: you only see rows with your own `user_id`. Insert checks also stop a session pointing at someone else's venue, a hand at someone else's session, or a star on someone else's hand.
- Database-level guards that back up the form validation: required columns are `not null`, buy-in and cash-out can't be negative, venue names and hand titles can't be blank.
- `schema.md` in plain English.

## Where the agent didn't follow the plan

PLAN.md section 3 says "every table except venues has user_id", but the same table lists user_id on venues. The agent noticed the contradiction and made venues per user; I kept that (reason in schema.md).
