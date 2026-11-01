# Prompt log: store net result (#21)

Agent: Claude Code (Claude Opus 5.5), 2026-11-01.

## How it came up

Preparing to import my real sessions (my decision: real results, every dollar ÷ 5), the agent read my records and found most sessions only have a net result and a time window. Only 15 of the 37 sessions I journaled since August note both buy-in and cash-out. The schema from PLAN.md section 3 required both, so importing real history would have meant inventing numbers.

## What the agent changed

- Migration `20261101010000_net_result.sql`: new required `net` column (backfilled for existing rows), buy-in and cash-out now optional, and a check that `net = cash_out − buy_in` whenever both are given. Applied in the Supabase SQL editor.
- Form: a "Net result" field; buy-in and cash-out marked optional. If you fill in buy-in and cash-out, net is worked out for you; if you fill in all three and they disagree, you get a message.
- Validation: net required unless buy-in and cash-out are both there; buy-in and cash-out come as a pair.
- Session page shows "—" for missing buy-in or cash-out. Stats and the dashboard read `net`.

## Checks

All 5 tests pass after the migration (the isolation test now writes `net`). Clicked through locally: buy-in alone is rejected with a pair message; net alone (+$840, 12pm–11pm) saves and shows +$76/h.
