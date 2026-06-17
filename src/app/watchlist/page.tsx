import { redirect } from "next/navigation";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/disclaimer";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";
import { getDataStore } from "@/lib/db";
import { WatchlistForm } from "./watchlist-form";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const store = getDataStore();
  const [watchlists, alerts] = await Promise.all([
    store.listWatchlists(user.id),
    store.listAlerts(user.id),
  ]);

  return (
    <main className="container max-w-3xl space-y-8 py-10">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Your watchlist</h1>
          <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
        </div>
        <form action={logoutAction}>
          <Button variant="outline" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </header>

      <Disclaimer />
      <p className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        A watchlist is a personal list of tickers you want to follow. It is <strong>not</strong> a
        recommendation to buy or sell any security, and nothing here is personalized financial
        advice.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New watchlist</CardTitle>
          <CardDescription>Saved to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <WatchlistForm />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Your watchlists
        </h2>
        {watchlists.length === 0 ? (
          <p className="text-sm text-muted-foreground">No watchlists yet.</p>
        ) : (
          <div className="space-y-2">
            {watchlists.map((w) => (
              <Card key={w.id}>
                <CardContent className="flex items-center justify-between gap-3 py-3">
                  <span className="text-sm font-medium">{w.name}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {w.tickers.map((t) => (
                      <Badge key={t} variant="secondary" className="font-mono text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          <Bell className="size-3.5" aria-hidden="true" />
          Alerts
        </h2>
        <p className="text-sm text-muted-foreground">
          {alerts.length === 0
            ? "No alerts. Alert delivery is a stubbed interface in the MVP — rules can be stored, but nothing is sent yet."
            : `${alerts.length} alert(s) queued. Delivery is stubbed in the MVP.`}
        </p>
      </section>
    </main>
  );
}
