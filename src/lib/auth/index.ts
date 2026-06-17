import "server-only";

import { cookies } from "next/headers";

import { getEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { SESSION_COOKIE, resolveMockUser, type AuthUser } from "@/lib/auth/mock";

export type { AuthUser } from "@/lib/auth/mock";
export { SESSION_COOKIE, MOCK_TEST_USER, resolveMockUser } from "@/lib/auth/mock";

/**
 * Resolve the current authenticated user, or null. Mock mode reads a signed-in
 * email from a cookie; Supabase mode reads the session from the SSR cookie store.
 * Defaults to mock so auth works locally with zero credentials.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const env = getEnv();

  if (env.AUTH_BACKEND === "supabase") {
    return getSupabaseUser();
  }

  const store = await cookies();
  return resolveMockUser(store.get(SESSION_COOKIE)?.value);
}

/** Set the mock session cookie (called from the sign-in server action). */
export async function signInMock(email: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, email.trim().toLowerCase(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/** Clear the session cookie. */
export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Supabase-backed user resolution. Uses the SSR cookie store. Only invoked when
 * AUTH_BACKEND=supabase and keys are present (deferred to Phase 8 / DEPLOY.md).
 */
async function getSupabaseUser(): Promise<AuthUser | null> {
  const env = getEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    logger.warn("AUTH_BACKEND=supabase but Supabase keys are missing; treating as signed out");
    return null;
  }
  const { createServerClient } = await import("@supabase/ssr");
  const store = await cookies();
  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => {
        try {
          for (const { name, value, options } of toSet) {
            store.set(name, value, options as Parameters<typeof store.set>[2]);
          }
        } catch {
          // Called from a Server Component where cookies are read-only — safe to ignore.
        }
      },
    },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}
