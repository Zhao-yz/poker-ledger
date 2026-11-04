# Prompt log: privacy adjustment and more hands (#37)

Agent: Claude Code (Claude Opus 5.5), 2026-11-04.

## Prompts

Summarized, not quoted, because the exact adjustment stays private: before the demo I asked the agent to change how my dollar amounts and session hours are adjusted for privacy, update my demo script, and bring in more real hands, because 8 felt too few.

## What changed

- My account's dollar amounts and session lengths were adjusted again in the Supabase SQL editor. Each update was limited to my account and stopped itself if the totals were not what it expected. Start times did not change, so the early vs. late split still holds the same sessions.
- 32 hands from my Chinese review notes were translated and added, for 40 in total. Every result was checked against the note it came from. Names were left out, and the new notes describe bet sizes as pot fractions or percentages.
- `README.md` now says the amounts and hours are approximate.
- `PLAN.md`: two new Plan vs. Reality rows.

No app code changed.
