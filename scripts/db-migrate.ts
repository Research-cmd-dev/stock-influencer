/**
 * Apply SQL migrations to a hosted Supabase project.
 *
 * Supabase has no first-class "run arbitrary SQL" REST endpoint, so this script
 * bundles every file in `supabase/migrations/` into one ordered script and prints
 * it. The human pastes it into the Supabase SQL editor (or pipes it to `psql`).
 * This keeps migrations reproducible without requiring a live DB connection during
 * the autonomous build (deferred per DEPLOY.md).
 *
 *   npm run db:migrate            # print the combined SQL
 *   npm run db:migrate > out.sql  # capture it
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { logger } from "../src/lib/logger";

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");

function main(): void {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    logger.warn("No migration files found", { dir: MIGRATIONS_DIR });
    return;
  }

  logger.info("Bundling migrations", { count: files.length, files });

  const banner = "-- ExecSignal combined migrations. Paste into the Supabase SQL editor.\n";
  const body = files
    .map((f) => `\n-- ===== ${f} =====\n${readFileSync(join(MIGRATIONS_DIR, f), "utf8")}`)
    .join("\n");

  process.stdout.write(`${banner}${body}\n`);
}

main();
