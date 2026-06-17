"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { createWatchlistAction, type WatchlistActionState } from "./actions";

const initial: WatchlistActionState = {};
const field =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function WatchlistForm() {
  const [state, action, pending] = useActionState(createWatchlistAction, initial);

  return (
    <form action={action} className="space-y-3">
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Name</span>
        <input name="name" required placeholder="AI compute" className={field} />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Tickers (comma or space separated)</span>
        <input name="tickers" placeholder="NVDA, AMD, SMH" className={field} />
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Create watchlist"}
        </Button>
        {state.ok ? <span className="text-sm text-bullish">Saved.</span> : null}
        {state.error ? <span className="text-sm text-bearish">{state.error}</span> : null}
      </div>
    </form>
  );
}
