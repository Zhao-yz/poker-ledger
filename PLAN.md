# PLAN.md — Poker Ledger

## 1. Pitch

I'm building Poker Ledger, a log for my live cash-game sessions, because my records today are a markdown table plus long review notes, and I can't filter them, star the hands I want to review again, or see my hourly rate by venue without running a script. I play 2 to 3 sessions a week at M8trix and Bay 101, so I'll log after every session and open the dashboard before I go play.

## 2. Features

Spine features first, then my three. Numbered in build order.

1. **Sign up and login.** As a player, I want to create an account with my email and a password, log in and log out, so that my results stay private to me.
2. **Data model.** As a player, I want each session tied to a venue and each hand tied to a session, so that I can look at results by venue and review the hands from one night together.
3. **Sessions CRUD.** As a player, I want to log a session with date, venue, start time, end time, stakes, buy-in and cash-out, see my list of sessions, open one session's detail page, edit it, and delete it after an "Are you sure?" prompt, so that my record stays accurate.
4. **Validation.** As a player, I want the form to stop me with a clear message if I leave date, venue, buy-in or cash-out blank, or enter an end time before the start time, so that bad rows never reach my stats.
5. **Hands inside a session.** As a player, I want to add hands to a session (hole cards, position, a one-line title, result in dollars, review notes), so that the key spots from a night live next to its result.
6. **Stars.** As a player, I want to star a hand and see all my starred hands on one page, so that I have a short list to study before my next session.
7. **Find things.** As a player, I want to filter sessions by venue, date range and win/loss, search hands by text (for example "TT" or "3B"), and sort by newest, biggest win or best hourly rate, so that I can find patterns fast.
8. **Dashboard.** As a player, I want a cumulative profit line chart and summary stats (total net, hourly rate, % of winning sessions, best month), so that I see whether I'm actually improving.
9. **CSV import (my feature 1).** As a player, I want to upload a CSV of past sessions, so that my 80+ existing sessions don't have to be typed by hand. My real sessions go in with every dollar amount (buy-in, cash-out, hand results) divided by 5 for privacy; dates, venues, hours and hands are unchanged, so every ratio and trend stays true.
10. **Early vs. late start (my feature 2).** As a player, I want a card comparing sessions that started before 3pm with sessions that started later (count, net, hourly), so that I can check my own rule that early sessions are where I make money.
11. **Random review (my feature 3).** As a player, I want a button that picks one random starred hand, so that I review something every day without choosing.

## 3. Database

Hosted Postgres on Supabase. Every table except `venues` has `user_id`, and row-level security only lets a user read or write rows where `user_id` is their own.

| Table | Columns (type) | Key / relationships |
| --- | --- | --- |
| `profiles` | id (uuid), display_name (text), created_at (date) | PK id = the Supabase auth user id; one profile per user |
| `venues` | id (number), user_id (uuid), name (text), city (text) | PK id; one venue has many sessions |
| `sessions` | id (number), user_id (uuid), venue_id (number), played_on (date), start_time (time), end_time (time), stakes (text), buy_in (number), cash_out (number), notes (text) | PK id; FK venue_id → venues; one session has many hands. Net = cash_out − buy_in, hours from start/end (past midnight counts as next day), both computed, not stored |
| `hands` | id (number), user_id (uuid), session_id (number), hole_cards (text), position (text), title (text), result (number), notes (text) | PK id; FK session_id → sessions (deleting a session deletes its hands) |
| `stars` | user_id (uuid), hand_id (number), created_at (date) | PK (user_id, hand_id); junction table making users ↔ hands many-to-many |

```
profiles 1 ──< sessions >── 1 venues
                   1
                   │
                   ^
                 hands  >──< profiles  (through stars)
```

## 4. Tests

1. **Data isolation.** Given User A has logged a session at M8trix and User B has an empty account, when User B loads the sessions list, then User B sees zero sessions and a direct request for User A's session id returns nothing.
2. **Dashboard hourly rate.** Given a user with two sessions, +$1,000 over 5 hours and −$200 over 3 hours, when the dashboard computes stats, then total net is $800 and the hourly rate is $100/hour (800 ÷ 8), not the average of the two sessions' rates.

## 5. Technologies

- **Coding agent: Claude Code**, because I already use it daily and it works directly with my local repo and GitHub.
- **Framework: Next.js with TypeScript**, so front end and server code live in one repo the agent knows well.
- **Database and auth: Supabase** (Postgres + email/password sign-up), because row-level security enforces "each user sees only their own data" inside the database, not just in the UI.
- **Hosting: Vercel**, because it redeploys automatically on every merge to main, so the live URL always matches main.
- **Libraries:** Tailwind CSS for styling, Recharts for the chart, Vitest for the two tests, Papa Parse for CSV import.

## 6. Design

Dark mode by default, poker-felt green (#0f5132) accents on a near-black background, white cards, red/green for losses and wins. Clean and data-first. Inspiration: Strava's activity dashboard (a stats strip above a feed) and the Poker Bankroll Tracker app (session list with net and hours on each row).

## 7. Risks and cuts

- **Least sure I can build:** the data-isolation test, because it has to create two real Supabase users inside a test and sign in as each.
- **Cut first if short on time:** random review (#11), then fold the early-vs-late card (#10) into the dashboard as one extra stat.

## Plan vs. Reality

The plan above stays as written.

| Planned feature | Shipped / Changed / Cut | Status (Done/Backlogged) | Learning | What changed and why (one line) |
| --- | --- | --- | --- | --- |
| 1. Sign up and login | Shipped | Done | Turning off email confirmation keeps a first-time sign-up to one step | Built as planned (PR #4) |
| 2. Data model | Changed | Done | A plan can contradict itself; the agent has to pick a side unless you do | Section 3's text said venues had no user_id but its table listed one; venues became per user (PR #6) |
| 3. Sessions CRUD | Changed | Done | Design the schema from the data you really have | Net result became the required field and buy-in and cash-out optional, because only 15 of 37 journaled sessions recorded both (PR #22) |
| 4. Validation | Changed | Done | Rules written from memory can break on real data | "End before start" became "end can't equal start, max 18 hours", because most sessions run past midnight (PR #10); required fields follow PR #22 |
| 5. Hands inside a session | Shipped | Done | Hiding old errors during a save matters as much as showing them | Built as planned, with a fix so old errors clear while saving (PR #12) |
| 6. Stars | Shipped | Done | A junction table keeps "my short list" simple | Built as planned (PR #14) |
| 7. Find things | Shipped | Done | Filters in the URL make a view bookmarkable | Built as planned, plus biggest-loss and oldest sorts (PR #16) |
| 8. Dashboard | Changed | Done | Check colors for color blindness, not only for taste | Chart colors moved from the planned red/green to blue/red after a color-blindness check failed; added a net-by-month chart (PR #18) |
| 9. CSV import | Changed | Done | Filling a column with a default is making data up | Imported 69 sessions since 2026-05-23, not all 80+; the default stakes column was removed because some stakes weren't recorded (PR #24) |
| 10. Early vs. late start | Shipped | Done | Testing the 14:59 / 15:00 edge pins down the rule | Built as planned (PR #26) |
| 11. Random review | Shipped | Done | An empty state needs its own path | Built as planned, picking from starred hands (PR #28) |
| Section 6 design: white cards | Changed | Done | A dark theme and white cards fight each other | Cards shipped dark to match the near-black background (visible in the live app) |
| Not planned: session date default | Added after testing | Done | Dates from UTC go wrong every evening, and nothing warns you | The form defaulted to tomorrow after 4pm Pacific; the first-time user test caught it (PR #32) |
| Not planned: net follows buy-in and cash-out | Added after testing | Done | A rule that protects data can also block a simple correction | Editing a cash-out was blocked by the old net; net now updates as you type (PR #34) |
| Not planned: separate board and betting-action fields for hands | Backlogged | Backlogged | Free-text notes are enough for now | The first-time user looked for them; notes cover it until I want to search by board |
| Feature 9 privacy rule | Changed | Done | What feels private changes once you picture the class looking at it | Dollar amounts and session hours are both adjusted for privacy, so they are approximate; the plan only covered dollars (data update, no code) |
| Feature 5 hands from my notes | Changed | Done | A demo looks thin until the real data is in | 40 real hands loaded from my review notes, up from 8, so search and stars have something to work with (data update, no code) |
