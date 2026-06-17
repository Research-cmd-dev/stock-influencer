import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/disclaimer";
import { getDataStore } from "@/lib/db";
import { StatementForm } from "./statement-form";

export const dynamic = "force-dynamic";

export default async function AdminStatementsPage() {
  const store = getDataStore();
  const [people, statements] = await Promise.all([
    store.listPeople(),
    store.listStatements({ limit: 8 }),
  ]);

  return (
    <main className="container max-w-4xl space-y-8 py-12">
      <header className="space-y-2">
        <Badge variant="outline" className="font-mono uppercase tracking-widest">
          Admin
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">Add a statement</h1>
        <p className="text-sm text-muted-foreground">
          Manual entry runs through the same validated, de-duplicated ingestion pipeline as
          automated sources.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New statement</CardTitle>
          <CardDescription>All fields are validated with Zod on the server.</CardDescription>
        </CardHeader>
        <CardContent>
          <StatementForm people={people} />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Recent statements
        </h2>
        <div className="space-y-2">
          {statements.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.title ?? s.rawText.slice(0, 80)}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.rawText}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {s.source}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">{s.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Disclaimer />
    </main>
  );
}
