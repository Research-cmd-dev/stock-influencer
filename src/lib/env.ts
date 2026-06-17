import { z } from "zod";

/**
 * Server-side environment schema. Kept permissive so the app boots and runs
 * fully against mock/fixture backends with zero credentials. Full boot-time
 * hardening (fail-fast on missing prod keys) is layered in Phase 8.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATA_BACKEND: z.enum(["fixture", "supabase"]).default("fixture"),
  LLM_BACKEND: z.enum(["mock", "anthropic"]).default("mock"),
  AUTH_BACKEND: z.enum(["mock", "supabase"]).default("mock"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),

  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

/** Parse and cache process.env once. Throws only on clearly-invalid values. */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}

/**
 * Fail-fast boot-time check: when a non-default (real-service) backend is selected,
 * the credentials it needs must be present. Called from instrumentation at startup.
 * The mock/fixture defaults require nothing, so offline runs never trip this.
 */
export function assertBackendEnv(): void {
  const env = getEnv();
  const missing: string[] = [];

  if (env.DATA_BACKEND === "supabase") {
    if (!env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  if (env.AUTH_BACKEND === "supabase") {
    if (!env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (env.LLM_BACKEND === "anthropic" && !env.ANTHROPIC_API_KEY) {
    missing.push("ANTHROPIC_API_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required env for selected backends: ${[...new Set(missing)].join(", ")}. ` +
        `Set them, or use the mock/fixture defaults (DATA_BACKEND=fixture, AUTH_BACKEND=mock, LLM_BACKEND=mock).`,
    );
  }
}
