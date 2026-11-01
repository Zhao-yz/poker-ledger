# Prompt log: random review (#27), my feature 3

Agent: Claude Code (Claude Opus 5.5), 2026-11-01.

## Prompt

Continuing "keep going" (PLAN.md feature 11).

## What the agent built

- "🎲 Review a random hand" button on the Starred page. It goes to `/review/random`, which picks one of my starred hands at random and opens it.
- The hand page then says "Picked at random from your starred hands" with an "Another one →" link.
- With nothing starred, the button is hidden; visiting `/review/random` directly goes back to Starred with "Star at least one hand first".

## Checks

Typecheck and lint pass. Locally: with no stars → Starred page with the note; after starring the TT hand → the button opens `/hands/1?from=random` with the banner.
