"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { loginAction, type LoginState } from "./actions";
import { MOCK_TEST_USER } from "@/lib/auth/mock";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={MOCK_TEST_USER.email}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      {state.error ? <p className="text-sm text-bearish">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Mock auth: any valid email signs you in as a test user. No password, no network.
      </p>
    </form>
  );
}
