# DEPLOY.md — Taking ExecSignal live

ExecSignal runs fully against mocks/fixtures with **no credentials**. This guide is
the exact set of **human** steps to switch on the real services. Do them in order;
each section is independent, so you can enable one backend at a time.

> You can deploy to Vercel on the mock backends first (it will just work), then flip
> each `*_BACKEND` to its real value as you provision the service.

---

## 0. Prerequisites

- A GitHub repo with this code (already set up).
- Accounts: [Vercel](https://vercel.com), [Supabase](https://supabase.com),
  [Anthropic](https://console.anthropic.com). All optional until you want that
  feature live.

---

## 1. Deploy the app to Vercel (mock backends — works immediately)

1. In Vercel, **New Project → Import** this GitHub repo.
2. Framework preset auto-detects **Next.js** (see `vercel.json`).
3. Set environment variables (Project → Settings → Environment Variables):
   ```
   DATA_BACKEND=fixture
   LLM_BACKEND=mock
   AUTH_BACKEND=mock
   LOG_LEVEL=info
   ```
4. **Deploy.** The app comes up on fixtures — dashboard, themes, exec timelines, the
   thread generator, and mock auth all work. Nothing else is required.

---

## 2. Supabase: database (DATA_BACKEND=supabase)

1. Create a Supabase project. Copy from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose)
2. **Run the migrations.** Either:
   - Run `npm run db:migrate` locally and paste the printed SQL into the Supabase
     **SQL Editor**, **or**
   - Open `supabase/migrations/0001_init.sql` then `0002_rls.sql` and run them in
     order in the SQL Editor.
   This creates `people`, `statements`, `themes`, `stock_mentions`,
   `user_watchlists`, `alerts`, with indexes and RLS policies (public read on
   editorial content; per-user ownership on watchlists/alerts).
3. **Seed demo data (optional):** set the three env vars locally in `.env.local`,
   set `DATA_BACKEND=supabase`, then `npm run db:seed` (upserts the 5 execs +
   statements + themes + mentions, preserving their fixture ids).
4. In Vercel, set `DATA_BACKEND=supabase` plus the three Supabase vars, and redeploy.
5. **Network (Claude Code on the web only):** if running ingestion/analysis from a
   cloud session, allowlist your Supabase host (`*.supabase.co` / `*.supabase.com`)
   in the environment's network config —
   see https://code.claude.com/docs/en/claude-code-on-the-web.

---

## 3. Supabase: auth (AUTH_BACKEND=supabase)

1. In Supabase **Authentication → Providers**, enable Email (or your chosen
   provider) and configure redirect URLs for your Vercel domain.
2. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
   (same as §2).
3. Set `AUTH_BACKEND=supabase` in Vercel and redeploy. `getCurrentUser()` then reads
   the Supabase session from cookies; `/watchlist` stays gated.
   > The mock email/password sign-in form at `/login` is mock-only. Wire the
   > Supabase auth UI/flow before flipping this in production.

---

## 4. Anthropic: the analysis engine (LLM_BACKEND=anthropic)

1. Create an API key at the Anthropic Console.
2. Set in Vercel:
   ```
   LLM_BACKEND=anthropic
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Redeploy. Analysis now uses `claude-sonnet-4-6` with retry/backoff, a 60s
   timeout, Zod-validated structured output, and per-call cost/usage logging.
4. **Network (Claude Code on the web only):** allowlist `api.anthropic.com`.

> The API key is **server-only** and read from `process.env.ANTHROPIC_API_KEY`. It is
> never bundled to the client. Do not paste long-lived production secrets into a
> shared cloud-session environment.

---

## 5. Deferred / future integrations

- **X (Twitter) posting** stays **disabled** in the MVP (`DisabledXPoster`). Threads
  are generated for manual posting via copy + web-intent. To enable real posting,
  implement the `ThreadPoster` interface behind an explicit, human-enabled flag and
  add `X_API_*` keys.
- **Real market data** for sparklines: only the deterministic `FixtureMarketProvider`
  exists today. Add a provider implementing `MarketDataProvider`, wire it in
  `src/lib/market/index.ts`, and add `MARKET_DATA_API_KEY`.
- **Alert delivery** is a stubbed `NoopAlertDelivery` job (MVP non-goal). Implement
  `AlertDeliveryJob` (email/push/webhook) and schedule it.

---

## 6. Boot-time validation

`src/instrumentation.ts` runs `assertBackendEnv()` at server startup. If you select a
real backend without its credentials, the server **fails fast** with a message naming
the missing variables — so a misconfigured deploy never silently serves broken pages.

## 7. Pre-deploy checklist

```bash
npm run typecheck && npm run lint && npm run test && npm run build
# and, where browsers are available:
npx playwright install --with-deps chromium && npm run test:e2e
```

All must pass. The disclaimer must render on every financial surface (asserted by the
Playwright smoke suite and the Disclaimer unit test).
