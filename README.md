# Poker Ledger

A private log for live poker cash-game sessions. Log each session (venue, start and end time, net result), attach the key hands from that night, star the hands you want to study, and see whether you're actually improving: running total, hourly rate, best month, and how sessions that started before 3pm compare with later ones.

**Live app:** https://poker-ledger-rust.vercel.app

Built for MBA 296C (Intro to Coding for MBAs) as the solo app. The plan is in [PLAN.md](PLAN.md), the database in [schema.md](schema.md), and the prompt log for every feature in [`prompts/`](prompts/).

## What you can do

- **Sign up / log in / log out** with email and password. Each account sees only its own data.
- **Sessions:** add, list, open, edit, delete (with an "Are you sure?" step). Enter the net result, or buy-in and cash-out and let the app work out the net. Sessions that run past midnight are handled.
- **Hands:** add key hands to a session (cards, position, title, result, review notes); edit and delete them.
- **Stars:** star any hand; the **Starred** page is your study list; **🎲 Review a random hand** picks one for you.
- **Find:** filter sessions by venue, date range and wins/losses; sort by newest, biggest win/loss or best hourly rate; search hands by text ("TT", "3-bet").
- **Dashboard:** total net, hourly rate (total net ÷ total hours), % winning sessions, best month, early vs. late start, running-total and net-by-month charts.
- **Import:** upload a CSV of past sessions with a preview, validation and duplicate skipping.

My own data in the live app comes from real sessions, but dollar amounts and session hours are adjusted for privacy, so treat them and the hourly rates as approximate. Dates, venues and hands are unchanged.

## Tools

| Piece | Tool | Why |
| --- | --- | --- |
| Coding agent | Claude Code | Works directly in the repo and with GitHub |
| App | Next.js 15 (App Router) + TypeScript + Tailwind CSS | One repo for pages and server code |
| Database + auth | Supabase (Postgres, email/password auth, row-level security) | "Each user sees only their own data" is enforced in the database |
| Hosting | Vercel | Redeploys on every merge to `main` |
| Charts / CSV / tests | Recharts, Papa Parse, Vitest | |

## Run it yourself

1. **Supabase:** create a project. In the SQL editor, run the files in [`supabase/migrations/`](supabase/migrations/) in filename order. Under Authentication → Sign In / Providers, turn off **Confirm email** if you want sign-up to log people straight in.
2. **Environment:** copy `.env.example` to `.env.local` and fill in the project URL and the publishable (anon) key from Project Settings → API Keys.
3. **Install and start:**
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:3000.
4. **Tests:** `npm test`. The dashboard test needs nothing else. The data-isolation test signs in as two real test users, so it also needs `.env.test.local` with `TEST_USER_A_EMAIL`, `TEST_USER_A_PASSWORD`, `TEST_USER_B_EMAIL`, `TEST_USER_B_PASSWORD` (accounts you created through the app's sign-up page); without that file it is skipped.
5. **Deploy:** import the repo in Vercel and add the same two `NEXT_PUBLIC_SUPABASE_*` variables.

## CSV format for import

Header row, then one session per row. Required: `date` (YYYY-MM-DD), `venue`, `start`, `end`, and either `net` or both `buy_in` and `cash_out`. Optional: `stakes`, `notes`. Times can be `14:30` or `2:30pm`.

```csv
date,venue,start,end,net
2026-10-30,M8trix,11am,2am,-280
2026-10-17,M8trix,12pm,11pm,840
```

## How it's built

Every feature went through the same loop: a GitHub issue with its user story → a feature branch → Claude Code builds it (key prompts saved in `prompts/<feature>.md`) → a pull request with `closes #N` → merge → Vercel redeploys. Nothing was committed straight to `main` except the empty first commit that created the branch.
