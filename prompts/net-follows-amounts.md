# Prompt log: net follows buy-in and cash-out (#33)

Agent: Claude Code (Claude Opus 5.5), 2026-11-03.

## Prompt

Same request as `prompts/session-date.md`: run the first-time user test with Codex in a browser, then fix what it finds. The agent chose this as a second fix.

## How it came up

Codex ranked this its top struggle. It changed a cash-out from $100 to $150 on a saved session, and Save stopped: "Save stopped because the existing −$200 net conflicted." It had to clear the net and save again. Earlier, on a new session, it saw the required Net field stay blank after entering buy-in and cash-out.

## What the agent built

- `workedOutNet()` in `src/lib/validation.ts`: net from buy-in and cash-out, or nothing until both are valid.
- `AmountFields` in `SessionForm.tsx`: net updates as you type and locks while it is worked out from the two amounts. Clear them and you can type a net again.
- The server still rejects a net that disagrees, so a row that skips the form can't get through.
- `src/lib/validation.test.ts`: four tests.

## Checks

11 tests pass; typecheck, lint and production build pass. After deploying, Codex checked both fixes again in the live app.
