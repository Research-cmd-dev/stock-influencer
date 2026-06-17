/**
 * Next.js instrumentation hook — runs once at server startup. Validates that the
 * environment has the credentials its selected backends require, failing fast in
 * misconfigured deployments rather than at first request.
 */
export async function register(): Promise<void> {
  // Only run on the Node.js server runtime (not edge).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { assertBackendEnv } = await import("@/lib/env");
  const { logger } = await import("@/lib/logger");
  try {
    assertBackendEnv();
    logger.info("Environment validated at boot");
  } catch (err) {
    logger.error("Environment validation failed at boot", { error: err });
    throw err;
  }
}
