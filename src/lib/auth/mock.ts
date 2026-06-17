/**
 * Cookie-based mock auth. Pure helpers here (no next/headers import) so they are
 * unit-testable; the cookie read/write lives in the server-only module.
 */

export interface AuthUser {
  id: string;
  email: string;
}

export const SESSION_COOKIE = "execsignal_session";

/** The single test user available in mock mode. */
export const MOCK_TEST_USER: AuthUser = {
  id: "u_test_user",
  email: "test@execsignal.dev",
};

/**
 * Resolve a mock user from a session cookie value. The cookie stores the user's
 * email; any non-empty value maps to a deterministic user id.
 */
export function resolveMockUser(cookieValue: string | undefined): AuthUser | null {
  if (!cookieValue) return null;
  const email = cookieValue.trim().toLowerCase();
  if (!email || !email.includes("@")) return null;
  if (email === MOCK_TEST_USER.email) return MOCK_TEST_USER;
  // Derive a stable id from the email so multiple test users are possible.
  const id = `u_${email.replace(/[^a-z0-9]/g, "_")}`;
  return { id, email };
}
