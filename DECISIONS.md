# Decisions

A running log of non-obvious engineering decisions and their rationale.

## Phase 0 — Foundation

- **Manual scaffold instead of `create-next-app`.** Avoids interactive prompts in the
  autonomous cloud session and gives precise control over the strict TS / ESLint / Tailwind
  config required by `CLAUDE.md`.
- **Tailwind v3.4 (not v4).** Most battle-tested path for shadcn/ui's CSS-variable theming;
  reduces setup risk during the autonomous run.
- **shadcn primitives hand-written** (`button`, `card`, `badge`) rather than via the
  interactive `shadcn` CLI, for the same no-prompt reason. `components.json` is present so the
  CLI can still add more components later.
- **ESLint 8 + `.eslintrc.json`** with `next lint`. Classic config is the most reliable with
  `eslint-config-next` today; `next lint` prints a deprecation notice but works on Next 15.
- **Backend selection via env (`DATA_BACKEND`, `LLM_BACKEND`).** Defaults to `fixture`/`mock`
  so the whole app compiles, runs, and tests with zero credentials (offline-first mandate).
- **`noUncheckedIndexedAccess` enabled** on top of strict mode for extra safety at array/record
  boundaries.
- **`db:migrate` / `db:seed` are guarded no-op placeholders** in Phase 0; real implementations
  land in Phase 1 (deferred against a hosted Supabase project per the kickoff).

## Later phases

- **Backend selection unified under env flags** (`DATA_BACKEND`, `LLM_BACKEND`, `AUTH_BACKEND`),
  all defaulting to mock/fixture so the app is fully offline-capable. Each real backend is loaded
  only when explicitly selected.
- **LLM analysis (Phase 3):** model is `claude-sonnet-4-6` per CLAUDE.md (the project constitution
  overrides the generic "default to Opus" guidance for this app's extraction). Structured output is
  parsed from text + Zod-validated (version-agnostic across SDK releases) rather than relying on a
  specific `messages.parse` API, since the real client isn't exercised in the offline test suite.
- **Auth (Phase 7):** mock cookie auth derives a stable user id from the email; the Supabase path
  uses `@supabase/ssr`. Pure `resolveMockUser` is unit-tested; cookie I/O lives in a server-only
  module so it doesn't leak into tests (vitest aliases `server-only` to an empty stub).
- **X posting (Phase 6) stays a disabled stub** (`DisabledXPoster`) and **alert delivery (Phase 7)**
  a no-op stub — both are explicit MVP non-goals; threads/alerts are produced but never sent.
- **Boot-time env hardening (Phase 8):** `assertBackendEnv()` runs from `src/instrumentation.ts` and
  fails fast when a real backend is selected without its credentials.
- **Playwright e2e** can't download browsers in the restricted cloud sandbox; Phase 4 routes +
  disclaimer were verified against a served production build instead (see BLOCKERS.md). The spec is
  committed and runs where browsers are available.
