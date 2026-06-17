import { describe, it, expect } from "vitest";

import { resolveMockUser, MOCK_TEST_USER } from "./mock";

describe("resolveMockUser", () => {
  it("returns null for a missing or empty cookie", () => {
    expect(resolveMockUser(undefined)).toBeNull();
    expect(resolveMockUser("")).toBeNull();
    expect(resolveMockUser("   ")).toBeNull();
  });

  it("returns null for a non-email value", () => {
    expect(resolveMockUser("not-an-email")).toBeNull();
  });

  it("maps the canonical test email to the fixed test user", () => {
    const user = resolveMockUser(MOCK_TEST_USER.email);
    expect(user).toEqual(MOCK_TEST_USER);
  });

  it("derives a stable id for other valid emails (case-insensitive)", () => {
    const a = resolveMockUser("Alice@Example.com");
    const b = resolveMockUser("alice@example.com");
    expect(a).toEqual(b);
    expect(a?.id).toBe("u_alice_example_com");
    expect(a?.email).toBe("alice@example.com");
  });
});
