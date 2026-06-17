# ExecSignal — Autonomous Build Kickoff Prompt (for Claude Code)

> **How to use this (Claude Code app / cloud sessions)**
> 
> 1. Put this project in a **GitHub repo** — cloud sessions only work with GitHub.
>    Commit `CLAUDE.md` at the repo root and this file’s `settings.json` at
>    `.claude/settings.json`. Cloud sessions start from a fresh clone, so any config
>    that isn’t committed to the repo does not exist in the session.
> 1. In the Claude app, connect that repo and start a Claude Code session on it.
> 1. Paste everything below the line as the first message. Claude proceeds through all
>    phases on its own, stopping only for the short list of reasons in the Autonomy
>    Contract, then pushes a branch you can open as a PR.
> 1. You can close the app and check back — the session keeps running. See the
>    “Running in the Claude Code app” section at the bottom for the cloud-specific
>    gotchas (network allowlist, secrets, session timeouts). Read those first.

-----

You are an expert full-stack engineer and product builder. You are building **ExecSignal**
end to end. Read `CLAUDE.md` first — it is the project constitution (stack, conventions,
data models, commands, quality gates, disclaimer rules, secrets policy). Follow it exactly.

## Autonomy Contract (this overrides any “wait for confirmation” instinct)

You run this build **autonomously from start to finish. Do NOT wait for human
confirmation between phases.** When a phase passes its gates, immediately begin the next.

The gate between phases is **self-verification**, not human approval. Advance only when
the Definition of Done in `CLAUDE.md` is green AND the phase’s acceptance criteria are met.

**Stop and ask the human ONLY when one of these is true:**

1. You need a secret, credential, or external account you cannot create yourself
   (e.g. a real Supabase project, Anthropic API key, X API keys) **and** there is no way
   to make further progress against a mock/fixture. (Usually there is — keep going.)
1. An action is **irreversible AND destructive AND not clearly authorized**: deleting
   data, resetting/pushing a real database, force-pushing, deploying to production,
   spending money, or posting real tweets.
1. You have attempted a phase’s gates and failed after **3 distinct approaches**, and you
   genuinely cannot proceed on any independent task either.
1. All phases are complete.

In every other situation, **keep working.** Do not stop to ask permission for routine
decisions — make a reasonable choice, record it in `DECISIONS.md`, and continue.

## Self-verification loop (run this constantly — it is what makes autonomy work)

- After every meaningful change, run the relevant gates (`typecheck`, `lint`, `build`,
  `test`, and `test:e2e` for UI phases). Fix failures and re-run until green.
- Before marking a phase done, spawn a **reviewer subagent** to check the phase’s diff
  against that phase’s acceptance criteria below. Ask it to report only real gaps
  (missing requirements, missing tests, missing disclaimer, type-unsafety) — not style
  nitpicks. Fix the gaps it finds, then re-verify. Do not over-engineer in response to
  speculative findings.
- Then commit: `feat(phase-N): <summary>`. Working state must always be committed so
  progress is durable and any phase can be rolled back.

## Blocker policy (never spin silently)

If you get stuck: try up to 3 genuinely different approaches. If still blocked, append to
`BLOCKERS.md` — the problem, what you tried, and your recommended path — then **move on to
the next independent task** instead of halting. Collect non-blocking questions in
`QUESTIONS.md` and keep building.

## Secrets & offline-first (critical)

You cannot provision real accounts. So build everything behind the interfaces described in
`CLAUDE.md` with working **mock/fixture implementations**, so the entire app compiles, runs,
and is testable with zero live credentials. Write `.env.example` documenting every required
variable, and `.env.local` with safe placeholders (gitignored, never committed). The human
plugs in real keys at the very end via `DEPLOY.md`. Do not block the build waiting for keys.

## Output at the end of EACH phase

Print, in this order:

1. **Summary** — what was built this phase.
1. **Files changed** — exact list of created/modified paths.
1. **Risks / open questions** — also appended to `QUESTIONS.md` / `BLOCKERS.md`.
1. **Next: Phase N+1 — <goal>** — then *immediately start it* (no pause, no paste needed).

When all phases are done, print a final report: what’s built, what works against mocks vs.
needs real keys, the contents of `BLOCKERS.md`/`QUESTIONS.md`, and the exact human steps
from `DEPLOY.md` to take it live.

-----

## Phase plan

Each phase lists a **goal** and an **exit gate** (acceptance criteria). The global
Definition of Done in `CLAUDE.md` applies on top of every exit gate. Use your planning/todo
feature to expand each phase into concrete steps before implementing it.

### Phase 0 — Foundation & data contracts

**Goal:** Scaffold Next.js 15 (App Router, TS strict) + Tailwind + shadcn/ui + lucide-react;
configure ESLint/Prettier, Vitest, Playwright; wire all `npm run` scripts from `CLAUDE.md`;
create the folder structure (`src/lib/{schemas,db,llm,sources,market}`, `src/components`,
`src/app`); define the 5 core **Zod schemas** (Person, Statement, Theme, StockMention,
UserWatchlist/Alert) with inferred types; add `src/lib/logger.ts` and a shared error helper;
add `.env.example` + placeholder `.env.local` + `.gitignore`; add the `<Disclaimer />`
component.
**Exit gate:** `typecheck`/`lint`/`build`/`test` all pass; app boots; `/` renders a styled
placeholder; a trivial schema test passes; initial commit made.

### Phase 1 — Database & data-access layer (Supabase)

**Goal:** SQL migrations for all tables (relations, indexes, RLS policies); a seed script
with 5 execs + several sample statements as fixtures; a typed data-access layer in
`src/lib/db/` behind an interface, with a real Supabase impl AND an in-memory fixture impl
used by tests. The DAL test suite uses ONLY the fixture impl so it needs no database and no
network. `db:migrate`/`db:seed` target a hosted Supabase project (applied later when keys +
network access are provided, or by pasting the generated SQL into the Supabase dashboard).
**Exit gate:** migration SQL files generate and parse cleanly; DAL unit tests pass against
the fixture impl; the app renders seed data with zero live credentials. Applying migrations
to a real Supabase project is deferred to Phase 8 / DEPLOY.md — do NOT block on it.

### Phase 2 — Statement ingestion

**Goal:** Manual statement entry (an admin route/form, Zod-validated). An automated ingestion
adapter interface in `src/lib/sources/` with at least one real source adapter (e.g. RSS/news
or transcript parser) plus a fixture adapter; dedupe logic; boundary validation with Zod.
**Exit gate:** ingesting a fixture batch lands validated, de-duplicated statements in the
store end to end; parser + dedupe have tests; bad input is rejected with logged errors.

### Phase 3 — LLM analysis engine (Anthropic SDK)

**Goal:** `LLMClient` interface in `src/lib/llm/` — real impl uses `@anthropic-ai/sdk`
(`claude-sonnet-4-6`), plus a deterministic mock for tests. Prompt templates that extract
signals from statements, cluster them into **Themes**, and identify **StockMentions** with
sentiment — all returned as **Zod-validated structured output**. Retry/backoff, timeouts,
and per-call cost/usage logging.
**Exit gate:** running analysis on fixture statements via the mock (and the real client if a
key is present) yields output that passes Zod validation and persists correctly; tests green;
no key required for the suite to pass.

### Phase 4 — Public dashboard (the premium UI)

**Goal:** The calm, dense, “Bloomberg-lite + FinTwit” home: executive cards (photo + latest
thesis), a themes feed, stock-mention chips with Recharts sparklines, fully responsive, dark
and high-signal. A `/style-guide` preview route showing the component system (this replaces
“use Artifacts” — Claude Code builds the real components and you review them live). The
`<Disclaimer />` renders prominently on every financial surface.
**Exit gate:** Playwright smoke test boots the app and asserts `/`, `/exec/[id]`, `/themes`,
and `/style-guide` render, and that the disclaimer is present on financial pages; a screenshot
is saved; basic a11y checks pass.

### Phase 5 — Detail & theme pages

**Goal:** Per-executive timeline of statements; per-theme page (summary + related stocks +
chart); statement detail (key quotes, extracted signals, source link). All wired from the
data layer.
**Exit gate:** routes render correctly from seed/fixture data; data-wiring tests pass;
disclaimer present.

### Phase 6 — X thread generation

**Goal:** Generate a high-quality multi-tweet thread from a theme or statement (suggested exec
photo, the thesis, a chart caption, and a disclaimer line), with copy-to-clipboard and an X
web-intent link. Real API posting stays behind a **disabled, stubbed adapter** (MVP does not
auto-post).
**Exit gate:** the generator produces Zod-validated thread output from fixtures; tests pass;
a preview UI renders a sample thread including its disclaimer.

### Phase 7 — Auth, watchlist & alert scaffolding (future-SaaS, minimal)

**Goal:** Supabase Auth; a minimal protected route; UserWatchlist & Alert tables wired with
types; alert **delivery left as a stubbed job interface** (not fully built — it’s a non-goal
for MVP). Strong disclaimers on any watchlist surface.
**Exit gate:** auth flow works locally with a test user or fully behind a mock; the protected
route is gated; tests pass.

### Phase 8 — Hardening, deploy config & docs

**Goal:** Validate `process.env` at boot with Zod; add error boundaries; review logging;
add `vercel.json`/build config; write `README.md` (setup) and `DEPLOY.md` (the exact human
steps: set env vars in Vercel + Supabase, run migrations, plug in keys, optional X/market-data
setup). Final full-suite pass + clean production build.
**Exit gate:** `build` clean; all unit + e2e tests green; `README.md` and `DEPLOY.md` complete
and accurate; final commit made; print the final report.

-----

## Non-goals for MVP (do not build these)

Advanced backtesting, community features, a paid tier, and live auto-posting to X.

## Reminder on responsible scope

ExecSignal is an **informational** product. Nothing it outputs may be framed as personalized
financial advice. The disclaimer requirement in `CLAUDE.md` is a hard gate, enforced in the
reviewer-subagent check every phase.

-----

### Running in the Claude Code app (cloud sessions) — read before you start

Cloud sessions run in a fresh, isolated, Anthropic-managed VM. That VM *is* your safety
boundary, so there’s no container to configure and no `--dangerously-skip-permissions` flag
to set — the committed `.claude/settings.json` allow/deny rules just reduce approval prompts.
A few cloud-specific things determine whether this build succeeds:

- **GitHub only.** The repo must live on GitHub. Commit `CLAUDE.md` and `.claude/settings.json`
  before starting, or the session won’t see them (fresh clone each time).
- **Network is restricted by default.** The VM can reach common package registries (so
  `npm install` works), but outbound calls to other hosts are blocked unless you allowlist
  them in the environment’s network config. Because this build is mock-first, the entire
  build/test loop completes under the default (“Trusted”) access. You only need to add custom
  domains when you wire up live services: `api.anthropic.com` (LLM), your Supabase project
  host (`*.supabase.co` / `*.supabase.com`), and any news/RSS source hosts for real ingestion.
- **Secrets.** There is no dedicated secrets vault yet — env vars set on the cloud environment
  are visible to anyone who can edit that environment, and `.env` files are blocked from the
  agent. So **do not paste long-lived production secrets.** You don’t need to: build against
  the mocks now, and add `ANTHROPIC_API_KEY` + Supabase keys later (locally or on a hosted
  deploy) per `DEPLOY.md`. Keep the autonomous run fully offline-capable.
- **Output is a branch + PR.** When Claude finishes (or each phase), it pushes to the working
  branch; push is proxy-restricted to that branch, so it’s safe. You review and open a PR.
  This is why committing per phase matters — progress is durable on the branch even if the
  session is reclaimed.
- **Sessions pause on inactivity.** A long multi-phase build may outlast the idle timeout; the
  environment gets reclaimed but your history is restored when you reopen the session (with a
  fresh VM, so dependencies reinstall — fine, since commits are safe). If it ever stops
  mid-build, just reopen and say “continue with the next phase”; `CLAUDE.md` keeps it on track.
- **Rate limits are shared** across your whole Claude account, and there’s no separate charge
  for the VM. A full 9-phase build consumes meaningful usage; on Pro you may hit limits during
  a long run (Max gives more headroom). Cloud sessions require Pro, Max, Team, or Enterprise.