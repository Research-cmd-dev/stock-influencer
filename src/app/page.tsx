import { Activity, LineChart, Radio } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/disclaimer";

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

export default function Home() {
  return (
    <main className="container flex min-h-screen flex-col justify-center py-16">
      <div className="mx-auto w-full max-w-4xl space-y-10">
        <header className="space-y-4">
          <Badge variant="outline" className="font-mono uppercase tracking-widest">
            Phase 0 · Foundation
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            ExecSignal
          </h1>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground">
            Influential AI/tech executive statements, turned into timely investment themes and
            stocks to watch. Calm, dense, premium — Bloomberg-lite meets high-signal FinTwit.
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

        <Card>
          <CardContent className="pt-5">
            <Disclaimer />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
