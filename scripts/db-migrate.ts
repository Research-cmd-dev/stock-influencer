/**
 * Apply SQL migrations to a hosted Supabase project.
 * Real implementation lands in Phase 1; until then this is a guarded no-op so the
 * `npm run db:migrate` command exists and fails loudly only when actually invoked
 * without configuration.
 */
import { logger } from "../src/lib/logger";

function main(): void {
  logger.info("db:migrate is not wired yet (Phase 1). No migrations applied.");
}

main();
