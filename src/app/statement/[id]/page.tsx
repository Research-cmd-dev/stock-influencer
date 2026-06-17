import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockChip } from "@/components/stock-chip";
import { Disclaimer } from "@/components/disclaimer";
import { getDataStore } from "@/lib/db";
import { getMentionsWithQuotes } from "@/lib/queries";

export default async function StatementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getDataStore();
  const statement = await store.getStatement(id);
  if (!statement) notFound();

  const [person, mentions] = await Promise.all([
    store.getPerson(statement.personId),
    store.listStockMentions({ statementId: statement.id }),
  ]);
  const mentionsWithQuotes = await getMentionsWithQuotes(mentions);

  return (
    <main className="container max-w-3xl space-y-8 py-10">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] uppercase">
            {statement.source}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">{statement.date}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{statement.title ?? "Statement"}</h1>
        {person ? (
          <Link href={`/exec/${person.id}`} className="text-sm text-primary hover:underline">
            {person.name} · {person.role}, {person.company}
          </Link>
        ) : null}
        <Disclaimer />
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Full text</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{statement.rawText}</p>
        {statement.sourceUrl ? (
          <a
            href={statement.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            View source
          </a>
        ) : null}
      </section>

      {statement.keyQuotes.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Key quotes</h2>
          <ul className="space-y-2 border-l-2 border-primary/40 pl-4">
            {statement.keyQuotes.map((q, i) => (
              <li key={i} className="text-sm italic">
                &ldquo;{q}&rdquo;
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {statement.extractedSignals.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Extracted signals
          </h2>
          <div className="space-y-2">
            {statement.extractedSignals.map((sig, i) => (
              <Card key={i}>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm">{sig.text}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {sig.category}
                  </Badge>
                  {sig.rationale ? (
                    <p className="mt-1 text-xs text-muted-foreground">{sig.rationale}</p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {mentionsWithQuotes.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Stocks mentioned
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {mentionsWithQuotes.map(({ mention, quote }) => (
              <StockChip key={mention.id} mention={mention} quote={quote} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
