# Prompt log: dashboard + test 2 (#17)

Agent: Claude Code (Claude Opus 5.5), 2026-11-01.

## Prompt

Continuing "keep going" (PLAN.md feature 8 and test 2).

## What the agent built

- The home page is now the dashboard: four tiles (total net, hourly rate, % of winning sessions, best month), a running-total line chart and a net-by-month bar chart, both with hover tooltips. Recharts.
- `src/lib/stats.ts`: one pure function that turns sessions into every number on the page. Hourly rate = total net ÷ total hours.
- Chart colors: gains blue `#3987e5`, losses red `#e5534b`. The agent first used the app's green/red and ran a color-blindness check, which failed (the two were only ΔE 6.1 apart for red-green color blindness); blue/red passes every check on the dark background.
- Test 2 in `src/lib/stats.test.ts` with Vitest (`npm test`).

## Red, then green

The agent temporarily changed `hourly` to the average of each session's own rate (a realistic bug), ran Vitest UI, and screenshotted the failure; then reverted and screenshotted the pass. Screenshots: `docs/tests/dashboard-hourly-red.jpg`, `docs/tests/dashboard-hourly-green.jpg`.

## Bugs caught on the real page

- With a single losing session the y-axis ran from −$198 to −$202, so the chart floated with no zero line. Fixed by always including $0 on both charts.
- "1 sessions" → "1 session".

## Setup note

Vitest 5 needed `@types/node` 22+ (npm refused the install on 20), so `@types/node` went to 24.
