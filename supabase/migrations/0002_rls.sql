-- ExecSignal — Row Level Security policies.
-- Editorial content (people, statements, themes, stock_mentions) is publicly
-- readable; writes are restricted to the service role (server-side ingestion/analysis).
-- User data (watchlists, alerts) is private to its owner.

-- Enable RLS everywhere -------------------------------------------------------
alter table public.people enable row level security;
alter table public.statements enable row level security;
alter table public.themes enable row level security;
alter table public.stock_mentions enable row level security;
alter table public.user_watchlists enable row level security;
alter table public.alerts enable row level security;

-- Public read on editorial content -------------------------------------------
drop policy if exists "people_public_read" on public.people;
create policy "people_public_read" on public.people for select using (true);

drop policy if exists "statements_public_read" on public.statements;
create policy "statements_public_read" on public.statements for select using (true);

drop policy if exists "themes_public_read" on public.themes;
create policy "themes_public_read" on public.themes for select using (true);

drop policy if exists "stock_mentions_public_read" on public.stock_mentions;
create policy "stock_mentions_public_read" on public.stock_mentions for select using (true);

-- Note: editorial writes use the service-role key, which bypasses RLS. No
-- insert/update policies are defined for anon/authenticated, so they cannot write.

-- Per-user ownership on watchlists -------------------------------------------
drop policy if exists "watchlists_owner_all" on public.user_watchlists;
create policy "watchlists_owner_all" on public.user_watchlists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Per-user ownership on alerts ------------------------------------------------
drop policy if exists "alerts_owner_all" on public.alerts;
create policy "alerts_owner_all" on public.alerts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
