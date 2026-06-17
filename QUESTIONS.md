# Questions

Non-blocking questions for the human, collected during the autonomous build. All
were resolved with reasonable defaults so the build never stalled; revisit when
wiring real services.

- **Ingestion source priority (Phase 2):** built a real RSS/news adapter (`RssSource`,
  RSS 2.0, injectable fetcher) plus a fixture adapter. Add transcript parsing later if
  desired — it implements the same `SourceAdapter` interface.
- **Market-data provider (Phase 4):** using a deterministic `FixtureMarketProvider` for
  sparklines. Pick a real provider when ready and implement `MarketDataProvider`
  (see DEPLOY.md §5).
- **Auth provider (Phase 7):** mock cookie auth by default; a Supabase SSR path is
  scaffolded. Wire the Supabase auth UI/flow before flipping `AUTH_BACKEND=supabase`
  in production (DEPLOY.md §3).
- **Executive photos:** `Person.photoUrl` is optional and currently unset in fixtures
  (cards render monogram avatars). Provide image URLs/assets when available.
