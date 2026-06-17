import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getEnv } from "@/lib/env";
import { ExternalServiceError } from "@/lib/errors";

/**
 * Build a server-side Supabase client using the service-role key. Server-only —
 * never import this into a client component. Throws if Supabase env vars are absent
 * (the app should be running the fixture backend in that case).
 */
export function createServiceClient(): SupabaseClient {
  const env = getEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new ExternalServiceError(
      "Supabase is not configured (set DATA_BACKEND=fixture, or provide NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).",
    );
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
