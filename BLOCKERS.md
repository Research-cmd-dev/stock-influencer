# Blockers

Append blockers here: the problem, what was tried, and a recommended path.

## Playwright browser binaries can't download in the cloud sandbox (non-blocking)

- **Problem:** `npx playwright install chromium` fails in this managed cloud session —
  the Chrome-for-Testing CDN is not on the environment's network allowlist, so the
  browser binary can't be fetched. The Playwright smoke suite (`npm run test:e2e`)
  therefore cannot execute *here*.
- **What was tried:** `npx playwright install chromium` and `install-deps` (both fail
  on download); confirmed it's a network-policy limitation, not a config error.
- **Workaround used:** Verified the Phase 4 exit criteria another way — built the app
  (`npm run build`), served the production build, and fetched `/`, `/themes`,
  `/exec/[id]`, `/themes/[id]`, and `/style-guide`, confirming each renders and that the
  financial disclaimer ("…not financial advice.") is present on the financial surfaces.
  The Playwright spec (`tests/e2e/smoke.spec.ts`) is committed and will run wherever
  browsers can be installed (local dev, or CI with network/allowlisted hosts).
- **Recommended path:** Run `npx playwright install --with-deps chromium` then
  `npm run test:e2e` in a local or CI environment with network access. To run e2e in
  this cloud environment, add the Playwright download hosts to the environment's network
  allowlist (see https://code.claude.com/docs/en/claude-code-on-the-web for network config).
