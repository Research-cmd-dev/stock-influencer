import Link from "next/link";

import { ExecCard } from "@/components/exec-card";
import { ThemeCard } from "@/components/theme-card";
import { StockChip } from "@/components/stock-chip";
import { Disclaimer } from "@/components/disclaimer";
import { getDataStore } from "@/lib/db";
import { getExecsWithLatest, getTopMentions, getMentionsWithQuotes } from "@/lib/queries";

export default async function Home() {
  const store = getDataStore();
  const [execs, themes, topMentions] = await Promise.all([
    getExecsWithLatest(),
    store.listThemes({ limit: 6 }),
    getTopMentions(6),
  ]);
  const mentionsWithQuotes = await getMentionsWithQuotes(topMentions);

  return (
    <main className="container space-y-12 py-10">
      <section className="space-y-3">
        <h1 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          What the people building AI are saying — turned into signal.
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Calm, dense, premium. Executive statements, clustered themes, and stocks to watch.
        </p>
        <Disclaimer className="max-w-2xl" />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Tracked executives
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {execs.map(({ person, latestStatement }) => (
            <ExecCard key={person.id} person={person} latestStatement={latestStatement} />
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Themes feed
            </h2>
            <Link href="/themes" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {themes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Stocks to watch
          </h2>
          <div className="space-y-2">
            {mentionsWithQuotes.map(({ mention, quote }) => (
              <StockChip key={mention.id} mention={mention} quote={quote} />
            ))}
          </div>
          <Disclaimer variant="inline" />
        </div>
      </section>
    </main>
  );
}
