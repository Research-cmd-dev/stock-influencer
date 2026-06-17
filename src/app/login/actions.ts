"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { signInMock, signOut } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

const EmailSchema = z.string().trim().email();

export interface LoginState {
  error?: string;
}

/** Mock sign-in: validates an email and sets the session cookie, then redirects. */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (getEnv().AUTH_BACKEND !== "mock") {
    return { error: "Mock sign-in is disabled (AUTH_BACKEND is not 'mock')." };
  }
  const parsed = EmailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }
  await signInMock(parsed.data);
  logger.info("Mock sign-in", { email: parsed.data });
  redirect("/watchlist");
}

export async function logoutAction(): Promise<void> {
  await signOut();
  redirect("/login");
}
