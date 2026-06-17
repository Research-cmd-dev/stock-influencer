import { getEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { DataStore } from "@/lib/db/types";
import { MemoryStore } from "@/lib/db/memory-store";
import { SupabaseStore } from "@/lib/db/supabase-store";
import { createServiceClient } from "@/lib/db/supabase-client";

export type { DataStore } from "@/lib/db/types";
export { MemoryStore } from "@/lib/db/memory-store";
export { SupabaseStore } from "@/lib/db/supabase-store";

let singleton: DataStore | null = null;

/**
 * Resolve the active DataStore based on DATA_BACKEND. Defaults to the in-memory
 * fixture store so the app runs with zero credentials. The Supabase store is loaded
 * lazily only when explicitly selected, keeping its client out of the default path.
 */
export function getDataStore(): DataStore {
  if (singleton) return singleton;

  const env = getEnv();
  if (env.DATA_BACKEND === "supabase") {
    // The Supabase client is constructed only here, when the backend is selected.
    logger.info("Using Supabase data backend");
    singleton = new SupabaseStore(createServiceClient());
  } else {
    logger.info("Using in-memory fixture data backend");
    singleton = new MemoryStore();
  }
  return singleton;
}

/** Test helper: replace the active store (e.g. with a non-seeded MemoryStore). */
export function __setDataStoreForTests(store: DataStore | null): void {
  singleton = store;
}
