import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SentimentBadge } from "@/components/sentiment-badge";
import { StockChip } from "@/components/stock-chip";
import { ThemeCard } from "@/components/theme-card";
import { Disclaimer } from "@/components/disclaimer";
import { getMarketProvider } from "@/lib/market";
import type { Theme } from "@/lib/schemas";

export const metadata = { title: "Style Guide · ExecSignal" };

const SAMPLE_THEME: Theme = {
  id: "t_sample",
  title: "Sample: AI Factory Buildout",
  summary: "A demonstration theme showing how clustered investment theses render in the system.",
  category: "ai-compute",
  confidence: 0.82,
  relatedStatementIds: [],
  relatedStockMentionIds: [],
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default async function StyleGuidePage() {
  const quote = await getMarketProvider().getQuote("NVDA");

  return (
    <main className="container max-w-4xl space-y-10 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Style guide</h1>
        <p className="text-sm text-muted-foreground">
          The ExecSignal component system — review primitives and composites live.
        </p>
      </header>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </Section>

      <Section title="Badges & sentiment">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <SentimentBadge sentiment="bullish" />
          <SentimentBadge sentiment="bearish" />
          <SentimentBadge sentiment="neutral" />
        </div>
      </Section>

      <Section title="Card">
        <Card>
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Dense, premium surface used throughout the app.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Card body content.</p>
          </CardContent>
        </Card>
      </Section>

      <Section title="Stock chip (with sparkline)">
        <div className="max-w-md">
          <StockChip
            mention={{ ticker: "NVDA", name: "NVIDIA Corporation", kind: "stock", sentiment: "bullish" }}
            quote={quote ?? undefined}
          />
        </div>
      </Section>

      <Section title="Theme card">
        <div className="max-w-md">
          <ThemeCard theme={SAMPLE_THEME} />
        </div>
      </Section>

      <Section title="Disclaimer">
        <Disclaimer />
        <Disclaimer variant="inline" />
      </Section>
    </main>
  );
}
