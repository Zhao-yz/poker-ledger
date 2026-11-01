# Schema

Postgres on Supabase. The SQL that creates it is [`supabase/migrations/20261101000000_init.sql`](supabase/migrations/20261101000000_init.sql).

## Tables

| Table | What one row is | Columns (type) | Keys |
| --- | --- | --- | --- |
| `profiles` | One person with an account | `id` (uuid), `display_name` (text), `created_at` (date-time) | PK `id`, same id as the Supabase login user. Created automatically on sign-up |
| `venues` | A card room, e.g. M8trix | `id` (number), `user_id` (uuid), `name` (text, required), `city` (text), `created_at` | PK `id`; `user_id` → profiles. A name can't repeat for the same user |
| `sessions` | One live session | `id` (number), `user_id` (uuid), `venue_id` (number, required), `played_on` (date, required), `start_time` (time, required), `end_time` (time, required), `stakes` (text), `buy_in` (number, required, ≥ 0), `cash_out` (number, required, ≥ 0), `notes` (text), `created_at` | PK `id`; `venue_id` → venues; `user_id` → profiles |
| `hands` | One key hand from a session | `id` (number), `user_id` (uuid), `session_id` (number, required), `hole_cards` (text), `position` (text), `title` (text, required), `result` (number), `notes` (text), `created_at` | PK `id`; `session_id` → sessions (deleting a session deletes its hands) |
| `stars` | "This user starred this hand" | `user_id` (uuid), `hand_id` (number), `created_at` | PK (`user_id`, `hand_id`), so a hand can be starred once per user |

Net result (`cash_out − buy_in`) and hours (`end_time − start_time`, adding a day when the session runs past midnight) are calculated in the app, not stored, so they can never disagree with the inputs.

## How the tables connect

```
profiles ──1:many──> venues ──1:many──> sessions ──1:many──> hands
    │                                                        ▲
    └──────────────1:many──> stars <──many:1─────────────────┘
```

- A user has many venues, sessions and hands.
- A venue has many sessions; a session belongs to exactly one venue.
- A session has many hands; a hand belongs to exactly one session.
- `stars` is the junction table that makes users ↔ hands many-to-many.

## Who can see what

Row-level security is on for every table. A logged-in user can only read, add, edit or delete rows whose `user_id` is their own. Inserts are also checked across tables: a session must point at your own venue, a hand at your own session, and a star at your own hand.

## Plan vs. what was built

Section 3 of PLAN.md says "every table except `venues` has `user_id`", but its own table lists `user_id` on venues. The agent built venues per user and I kept it, because a shared venue list would let one user rename a room in someone else's history.
