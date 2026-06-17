-- ExecSignal — initial schema
-- Tables: people, statements, themes, stock_mentions, user_watchlists, alerts.
-- Applied to a hosted Supabase project via `npm run db:migrate` or by pasting into
-- the Supabase SQL editor. Safe to re-run (idempotent guards where practical).

create extension if not exists "pgcrypto";

-- People ----------------------------------------------------------------------
create table if not exists public.people (
  id          text primary key default ('p_' || gen_random_uuid()),
  name        text not null,
  role        text not null,
  company     text not null,
  ticker      text,
  photo_url   text,
  x_handle    text,
  bio         text,
  created_at  timestamptz not null default now()
);

-- Statements ------------------------------------------------------------------
create table if not exists public.statements (
  id                text primary key default ('s_' || gen_random_uuid()),
  person_id         text not null references public.people (id) on delete cascade,
  source            text not null,
  source_url        text,
  title             text,
  date              date not null,
  raw_text          text not null,
  key_quotes        jsonb not null default '[]'::jsonb,
  extracted_signals jsonb not null default '[]'::jsonb,
  dedupe_hash       text unique,
  created_at        timestamptz not null default now()
);

create index if not exists statements_person_id_idx on public.statements (person_id);
create index if not exists statements_date_idx on public.statements (date desc);

-- Themes ----------------------------------------------------------------------
create table if not exists public.themes (
  id                          text primary key default ('t_' || gen_random_uuid()),
  title                       text not null,
  summary                     text not null,
  category                    text not null,
  confidence                  double precision not null check (confidence >= 0 and confidence <= 1),
  related_statement_ids       jsonb not null default '[]'::jsonb,
  related_stock_mention_ids   jsonb not null default '[]'::jsonb,
  updated_at                  timestamptz not null default now()
);

create index if not exists themes_category_idx on public.themes (category);
create index if not exists themes_confidence_idx on public.themes (confidence desc);

-- Stock mentions --------------------------------------------------------------
create table if not exists public.stock_mentions (
  id                   text primary key default ('m_' || gen_random_uuid()),
  ticker               text not null,
  name                 text not null,
  kind                 text not null check (kind in ('stock', 'etf')),
  context              text not null,
  sentiment            text not null check (sentiment in ('bullish', 'bearish', 'neutral')),
  source_statement_id  text not null references public.statements (id) on delete cascade,
  created_at           timestamptz not null default now()
);

create index if not exists stock_mentions_ticker_idx on public.stock_mentions (ticker);
create index if not exists stock_mentions_statement_idx on public.stock_mentions (source_statement_id);

-- User watchlists -------------------------------------------------------------
create table if not exists public.user_watchlists (
  id          text primary key default ('w_' || gen_random_uuid()),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null default 'My Watchlist',
  tickers     jsonb not null default '[]'::jsonb,
  person_ids  jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists user_watchlists_user_idx on public.user_watchlists (user_id);

-- Alerts ----------------------------------------------------------------------
create table if not exists public.alerts (
  id            text primary key default ('a_' || gen_random_uuid()),
  user_id       uuid not null references auth.users (id) on delete cascade,
  watchlist_id  text not null references public.user_watchlists (id) on delete cascade,
  rule          jsonb not null,
  status        text not null default 'pending' check (status in ('pending', 'sent', 'dismissed')),
  message       text not null,
  created_at    timestamptz not null default now()
);

create index if not exists alerts_user_idx on public.alerts (user_id);
