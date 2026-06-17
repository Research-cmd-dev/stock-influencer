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
