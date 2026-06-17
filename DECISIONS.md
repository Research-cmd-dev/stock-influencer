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
