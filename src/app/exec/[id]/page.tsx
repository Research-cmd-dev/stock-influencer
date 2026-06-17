import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/disclaimer";
import { getDataStore } from "@/lib/db";

export default async function ExecPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getDataStore();
  const person = await store.getPerson(id);
  if (!person) notFound();

  const statements = await store.listStatements({ personId: id });

  return (
    <main className="container max-w-3xl space-y-8 py-10">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{person.name}</h1>
          {person.ticker ? (
            <Badge variant="secondary" className="font-mono">
              {person.ticker}
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {person.role} · {person.company}
        </p>
        {person.bio ? <p className="text-sm text-muted-foreground">{person.bio}</p> : null}
        <Disclaimer />
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Statement timeline
        </h2>
        <ol className="space-y-4">
          {statements.map((s) => (
            <li key={s.id}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{s.title ?? "Statement"}</CardTitle>
                    <span className="font-mono text-xs text-muted-foreground">{s.date}</span>
                  </div>
                  <Badge variant="outline" className="w-fit font-mono text-[10px] uppercase">
                    {s.source}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{s.rawText}</p>
                  {s.keyQuotes.length > 0 ? (
                    <ul className="space-y-1 border-l-2 border-primary/40 pl-3">
                      {s.keyQuotes.map((q, i) => (
                        <li key={i} className="text-sm italic">
                          &ldquo;{q}&rdquo;
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {s.extractedSignals.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {s.extractedSignals.map((sig, i) => (
                        <Badge key={i} variant="default" className="text-[10px]">
                          {sig.text}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {s.sourceUrl ? (
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Source
                    </a>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
