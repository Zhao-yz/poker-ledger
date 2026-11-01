# Prompt log: CSV import (#23), my feature 1

Agent: Claude Code (Claude Opus 5.5), 2026-11-01.

## Prompt

Continuing "keep going" (PLAN.md feature 9), plus my earlier decision: real results, every dollar ÷ 5.

## What the agent built

- `/import` page (in the nav): pick a CSV, see a preview ("3 of 4 rows are ready to import · total net +$650" plus a line-by-line list of problems), then import.
- Columns: date, venue, start, end, net, buy_in, cash_out, stakes, notes. Times can be `14:30` or the way my notes write them (`2pm`, `11:30am`, `~6:30pm`).
- Every row goes through the same validation as the session form, in the browser for the preview and again on the server before saving. Unknown venues are created. A row that matches a session already logged (same date, venue and start time) is skipped, so importing the same file twice doesn't double-count.
- Parsing tests in `src/lib/csv.test.ts`.

## My real data

The agent generated the CSV from my session table (69 sessions since 2026-05-23, every net ÷ 5, total +$6,940). It first filled a "2/3/5" stakes column for every row, then removed it: some sessions were at Bay 101 and the stakes weren't recorded, so that column would have been made up. The private home game is labelled "Home game (South Bay)" with no host name. The CSV is not in this repo.

## Checks

7 tests pass. Locally: a 4-row sample shows 3 ready and flags the row with no end time; importing adds 2 and skips the one already logged; importing again adds 0 and skips 2.

## Open question

After the first sample import, the browser ended up on the dashboard instead of showing the result card; the second time the result card showed as expected. Not reproduced yet.
