-- Poker Ledger schema (PLAN.md section 3).
-- Every table carries user_id, and row-level security (RLS) only lets a logged-in user
-- read or write rows whose user_id is their own. Isolation lives in the database,
-- so even a hand-crafted request for someone else's row comes back empty.

-- One profile per account, created automatically when someone signs up.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Card rooms. Each user keeps their own list (one venue → many sessions).
create table public.venues (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  city text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- The main item: one row per live session. Net result and hours are computed, not stored.
create table public.sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  venue_id bigint not null references public.venues (id) on delete restrict,
  played_on date not null,
  start_time time not null,
  end_time time not null,
  stakes text,
  buy_in numeric(10, 2) not null check (buy_in >= 0),
  cash_out numeric(10, 2) not null check (cash_out >= 0),
  notes text,
  created_at timestamptz not null default now()
);

-- Key hands from a session (one session → many hands). Deleting a session deletes its hands.
create table public.hands (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  session_id bigint not null references public.sessions (id) on delete cascade,
  hole_cards text,
  position text,
  title text not null check (length(trim(title)) > 0),
  result numeric(10, 2),
  notes text,
  created_at timestamptz not null default now()
);

-- Junction table: "this user starred this hand". One table for everyone.
create table public.stars (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  hand_id bigint not null references public.hands (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, hand_id)
);

create index sessions_user_played_on on public.sessions (user_id, played_on desc);
create index hands_session on public.hands (session_id);
create index stars_hand on public.stars (hand_id);

-- Row-level security.
alter table public.profiles enable row level security;
alter table public.venues enable row level security;
alter table public.sessions enable row level security;
alter table public.hands enable row level security;
alter table public.stars enable row level security;

create policy "own profile" on public.profiles
  for all to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "own venues" on public.venues
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- A session may only point at one of your own venues.
create policy "own sessions" on public.sessions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.venues v where v.id = venue_id and v.user_id = (select auth.uid()))
  );

-- A hand may only be attached to one of your own sessions.
create policy "own hands" on public.hands
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.sessions s where s.id = session_id and s.user_id = (select auth.uid()))
  );

-- You may only star your own hands.
create policy "own stars" on public.stars
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.hands h where h.id = hand_id and h.user_id = (select auth.uid()))
  );
