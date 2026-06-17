# ExecSignal

A premium web platform that tracks public statements from influential AI/tech
executives (Jensen Huang, Lisa Su, Satya Nadella, Sundar Pichai, Andy Jassy) and
turns them into timely, high-signal investment **themes** and **stocks/ETFs to
watch**. Aesthetic target: calm, dense, premium — "Bloomberg-lite meets high-signal
FinTwit."

> **ExecSignal is an informational product. Nothing it outputs is personalized
> financial advice.** A disclaimer renders on every surface that shows tickers,
> themes, sentiment, or "stocks to watch."

## Highlights

- **Offline-first.** The entire app compiles, runs, and is fully testable with **zero
  credentials** — every external service sits behind an interface with a mock/fixture
  implementation (data, LLM, ingestion sources, market data, auth).
- **Typed end to end.** TypeScript strict; Zod is the source of truth for every data
  shape and every external boundary is parsed before use.
- **The analysis engine.** The Anthropic SDK (`claude-sonnet-4-6`) extracts signals,
  clusters themes, and identifies stock mentions — all returned as Zod-validated
  structured output, with a deterministic mock for tests.

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS + shadcn-style UI primitives + lucide-react
- Recharts (sparklines)
- Supabase (Postgres + Auth) behind a typed data-access layer
- Zod (validation), Anthropic SDK (analysis)
- Vitest (unit/integration) + Playwright (smoke/e2e)

## Quick start

```bash
npm install
cp .env.example .env.local   # safe placeholders; the app runs fully on mocks
npm run dev                  # http://localhost:3000
```

No keys are required for local development — the defaults are
`DATA_BACKEND=fixture`, `LLM_BACKEND=mock`, `AUTH_BACKEND=mock`.

### Sign in (mock auth)

Visit `/login` and submit any valid email (pre-filled with a test user). Mock auth
sets an httpOnly cookie — no password, no network. `/watchlist` is gated and
redirects to `/login` when signed out.

## Commands

```bash
npm run dev          # local dev server
npm run build        # production build (must pass before any phase is "done")
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test         # vitest run (database-free; runs on fixtures, no network)
npm run test:e2e     # playwright smoke tests (needs browsers; see note)
npm run db:migrate   # bundle SQL migrations for a hosted Supabase project
npm run db:seed      # seed fixtures into a hosted Supabase project
npm run format       # prettier --write
```

> **Playwright note:** `npm run test:e2e` requires browser binaries
> (`npx playwright install --with-deps chromium`) and a network that can reach the
> Chrome-for-Testing CDN. In restricted CI/sandboxes, allowlist those hosts first.

## Project structure

```
src/
  app/                 # App Router routes
    page.tsx           # dashboard (exec cards, themes feed, stocks to watch)
    themes/            # themes index, [id] detail, [id]/thread generator
    exec/[id]/         # executive statement timeline
    statement/[id]/    # statement detail (quotes, signals, mentions)
    admin/statements/  # manual statement entry (Zod-validated ingestion)
    login/, watchlist/ # mock auth + protected watchlist
    style-guide/       # component system preview
  components/          # UI primitives + composites (ExecCard, ThemeCard, StockChip…)
  lib/
    schemas/           # Zod data contracts (Person, Statement, Theme, …)
    db/                # DataStore interface + MemoryStore (fixtures) + SupabaseStore
    llm/               # LLMClient + AnthropicLLMClient + MockLLMClient + analysis
    sources/           # ingestion adapters (RSS + fixture) + dedupe pipeline
    market/            # market-data provider (fixture) for sparklines
    thread/            # X thread generation + disabled poster stub
    auth/              # mock + Supabase auth
    alerts/            # stubbed alert-delivery job
supabase/migrations/   # SQL: tables + indexes + RLS policies
scripts/               # db:migrate / db:seed
tests/e2e/             # Playwright smoke suite
```

## Backends (switchable via env)

| Concern  | Default (offline) | Real service | Env var         |
| -------- | ----------------- | ------------ | --------------- |
| Data     | `fixture`         | `supabase`   | `DATA_BACKEND`  |
| LLM      | `mock`            | `anthropic`  | `LLM_BACKEND`   |
| Auth     | `mock`            | `supabase`   | `AUTH_BACKEND`  |
| Market   | `fixture`         | (future)     | —               |

The server validates required credentials at boot (`src/instrumentation.ts`): if you
select a real backend without its keys, startup fails fast with a clear message.

## Going live

See [DEPLOY.md](./DEPLOY.md) for the exact human steps: provision Supabase, run
migrations, set env vars in Vercel, and plug in the Anthropic key.
