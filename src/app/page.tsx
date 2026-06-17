import { Activity, LineChart, Radio } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/disclaimer";
import { getDataStore } from "@/lib/db";

const highlights = [
  {
    icon: Radio,
    title: "Track the signal",
    body: "Public statements from Jensen Huang, Lisa Su, Satya Nadella, and more — captured and structured.",
  },
  {
    icon: Activity,
    title: "Cluster into themes",
    body: "AI compute, data centers, chips, and infrastructure — synthesized into high-signal investment themes.",
  },
  {
    icon: LineChart,
    title: "Stocks to watch",
    body: "Specific tickers and ETFs each theme touches, with sentiment and source-linked context.",
  },
];

export default async function Home() {
  const store = getDataStore();
  const [people, themes] = await Promise.all([
    store.listPeople(),
    store.listThemes({ limit: 3 }),
  ]);

  return (
    <main className="container flex min-h-screen flex-col justify-center gap-12 py-16">
      <div className="mx-auto w-full max-w-5xl space-y-12">
        <header className="space-y-4">
          <Badge variant="outline" className="font-mono uppercase tracking-widest">
            ExecSignal
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            AI/tech exec statements, turned into signal.
          </h1>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground">
            Calm, dense, premium — Bloomberg-lite meets high-signal FinTwit. Timely investment
            themes and stocks to watch, sourced from what the people building AI actually say.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Tracked executives
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <Card key={person.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{person.name}</CardTitle>
                    {person.ticker ? (
                      <Badge variant="secondary" className="font-mono">
                        {person.ticker}
                      </Badge>
                    ) : null}
                  </div>
                  <CardDescription>
                    {person.role} · {person.company}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Latest themes
          </h2>
          <div className="grid gap-3 lg:grid-cols-3">
            {themes.map((theme) => (
              <Card key={theme.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">
                      {theme.category}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      {(theme.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <CardTitle className="text-base leading-snug">{theme.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{theme.summary}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <Disclaimer />
      </div>
    </main>
  );
}
