-- Most of my real sessions only record a net result and a time window; buy-in and
-- cash-out were written down for a minority. `net` becomes the required number, and
-- buy-in / cash-out become optional details. When both are given, net must match them.

alter table public.sessions add column net numeric(10, 2);
update public.sessions set net = cash_out - buy_in;
alter table public.sessions alter column net set not null;

alter table public.sessions alter column buy_in drop not null;
alter table public.sessions alter column cash_out drop not null;

alter table public.sessions add constraint sessions_net_matches
  check (buy_in is null or cash_out is null or net = cash_out - buy_in);
