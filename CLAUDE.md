# CLAUDE.md — ExecSignal

> Claude Code reads this file at the start of every session. It is the ground truth
> for how this project is built. Keep it accurate; update it when conventions change.

## What we’re building

A premium web platform + companion X account that tracks public statements from
influential AI/tech executives (Jensen Huang first; then Lisa Su, Satya Nadella,
Sundar Pichai, and 2–3 others) and turns them into timely, high-signal investment
**themes** (AI power, data centers, chips, infrastructure) plus specific
**stocks/ETFs to watch**. Aesthetic target: calm, dense, premium — high-quality
FinTwit (e.g. @HuangTracker) meets a “Bloomberg terminal lite.”

This is an information product. **It is never personalized financial advice.**

## Tech stack (do not change without a justified reason recorded in DECISIONS.md)

- Next.js 15 (App Router) + React + TypeScript (strict)
- Tailwind CSS + shadcn/ui + lucide-react
- Recharts for charts/sparklines
- Supabase (Postgres + Auth + Realtime) accessed through a typed data layer
- Zod for ALL data validation (every external boundary parses with Zod)
- Anthropic SDK (`@anthropic-ai/sdk`) for the app’s own LLM analysis
- Vitest (unit/integration) + Playwright (smoke/e2e)
- Deploy: Vercel (app) + Supabase (db)

## Commands (these must always work; wire them up in Phase 0)

```bash
npm run dev          # local dev server
npm run build        # production build — MUST pass before any phase is "done"
npm run typecheck    # tsc --noEmit — MUST pass
npm run lint         # eslint — MUST pass
npm run test         # vitest run — MUST pass
npm run test:e2e     # playwright smoke tests
npm run db:migrate   # apply Supabase migrations to a hosted Supabase project (or paste SQL in dashboard)
npm run db:seed      # load fixtures (5 execs + sample statements) into that project
```

> Note: the test suite is database-free — it runs against the in-memory fixture data layer,
> so `npm run test` needs no Postgres and no network. `db:migrate`/`db:seed` only matter once
> you connect a real hosted Supabase project (deferred until keys are available; see DEPLOY.md).

## Definition of done (the quality gate for EVERY phase)

A phase is not complete, and you do not commit or advance, until ALL of these are green:

1. `npm run typecheck` passes (zero errors)
1. `npm run lint` passes (zero errors)
1. `npm run build` passes
1. `npm run test` passes
1. Phase-specific acceptance criteria in the kickoff prompt are met
1. The financial disclaimer renders on every surface that shows tickers/themes

If a gate fails: fix it and re-run until green. Never lower a gate to make it pass.

## Conventions

- **TypeScript strict.** No `any`. Prefer `unknown` + Zod parse at boundaries.
- **Zod is the source of truth** for data shapes. Infer TS types from schemas
  (`z.infer<typeof X>`), don’t hand-write parallel interfaces.
- **Error handling everywhere.** No silent catches. Every async boundary handles
  failure and logs with context via the shared logger (`src/lib/logger.ts`).
- **Structured logging**, not bare `console.log`, in app/server code.
- **External services live behind interfaces** with a mock implementation so the
  app compiles, runs, and is fully testable WITHOUT live credentials:
  - `src/lib/db/` — data access (real Supabase impl + in-memory fixture impl)
  - `src/lib/llm/` — `LLMClient` interface (real Anthropic impl + deterministic mock)
  - `src/lib/sources/` — ingestion source adapters (real + fixture)
  - `src/lib/market/` — quote/chart data adapter (real + fixture)
- **Server-only secrets** never reach the client bundle. Use server components /
  route handlers / server actions for anything touching keys.
- File naming: kebab-case files, PascalCase components, camelCase functions.
- Commit per completed phase: `feat(phase-N): <short summary>` (Conventional Commits).

## Anthropic SDK usage (the app’s analysis engine)

- Default model for theme + stock extraction: `claude-sonnet-4-6`
- Cheap high-volume signal classification: `claude-haiku-4-5-20251001`
- Reserve `claude-opus-4-8` for cases needing max reasoning quality
- Always request **structured output and validate it with Zod** before persisting.
- Add retry with backoff, timeouts, and a per-call cost/usage log.
- Never hardcode an API key; read from `process.env.ANTHROPIC_API_KEY`.

## Data models (defined in Phase 0 as Zod schemas in `src/lib/schemas/`)

- **Person** — executive (name, role, company, photoUrl, x handle, bio)
- **Statement** — a public statement (personId, source, sourceUrl, date,
  rawText, keyQuotes[], extractedSignals[])
- **Theme** — clustered investment theme (title, summary, category, confidence,
  relatedStatementIds[], relatedStockMentionIds[])
- **StockMention** — company/ETF reference (ticker, name, kind: stock|etf,
  context, sentiment, sourceStatementId)
- **UserWatchlist** & **Alert** — future SaaS (userId, tickers[], rules[]); the
  tables exist and types are wired, but alert delivery is a stubbed interface in MVP.

## Disclaimers (non-negotiable)

Every page/component that shows tickers, themes, sentiment, or “stocks to watch”
must render the shared `<Disclaimer />` prominently:

> “This is for informational purposes only and is not financial advice.”

Generated X threads must include a short disclaimer line. The product must never
phrase anything as a personalized recommendation to buy or sell.

## Secrets & external accounts (you cannot provision these — humans do)

Document every required env var in `.env.example`. Put placeholder values in
`.env.local` (gitignored). NEVER invent real secrets and NEVER commit them. Build
against the mock implementations so the full app works offline; the human plugs in
real keys at the end (see DEPLOY.md). Required vars include:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`ANTHROPIC_API_KEY`, and (deferred) X/market-data keys.

## Do NOT touch / do NOT do without asking

- Do not push to a remote, deploy to Vercel, or run destructive DB commands
  (`db reset`, `db push` to a real project) without explicit human approval.
- Do not auto-post to X. MVP generates threads; real posting stays behind a
  disabled, stubbed adapter.
- Do not edit generated files (`src/components/ui/*` from shadcn) by hand unless
  necessary; prefer regenerating or wrapping.
- Do not commit `.env*` files other than `.env.example`.

## Working rhythm

Plan → implement in small steps → run the gates → self-review the diff against the
phase’s acceptance criteria (use a reviewer subagent) → fix gaps → commit → move on.
Log blockers to BLOCKERS.md and questions to QUESTIONS.md; keep working on
independent tasks rather than stalling.