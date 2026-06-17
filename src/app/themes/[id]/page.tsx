import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockChip } from "@/components/stock-chip";
import { Disclaimer } from "@/components/disclaimer";
import { getDataStore } from "@/lib/db";
import { getThemeWithMentions, getMentionsWithQuotes } from "@/lib/queries";

export default async function ThemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getThemeWithMentions(id);
  if (!data) notFound();

  const { theme, mentions } = data;
  const store = getDataStore();
  const [mentionsWithQuotes, statements] = await Promise.all([
    getMentionsWithQuotes(mentions),
    Promise.all(theme.relatedStatementIds.map((sid) => store.getStatement(sid))),
  ]);
  const relatedStatements = statements.filter((s) => s !== null);

  return (
    <main className="container max-w-4xl space-y-8 py-10">
      <header className="space-y-3">
        <Badge variant="outline" className="font-mono text-[10px] uppercase">
          {theme.category}
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">{theme.title}</h1>
        <p className="text-muted-foreground">{theme.summary}</p>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-muted-foreground">
            Confidence {Math.round(theme.confidence * 100)}%
          </span>
          <Link href={`/themes/${theme.id}/thread`} className="font-medium text-primary hover:underline">
            Generate X thread →
          </Link>
        </div>
        <Disclaimer />
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Stocks to watch
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {mentionsWithQuotes.map(({ mention, quote }) => (
            <StockChip key={mention.id} mention={mention} quote={quote} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Supporting statements
        </h2>
        <div className="space-y-3">
          {relatedStatements.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{s.title ?? "Statement"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{s.rawText}</p>
                <Link href={`/exec/${s.personId}`} className="text-xs text-primary hover:underline">
                  View executive
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
