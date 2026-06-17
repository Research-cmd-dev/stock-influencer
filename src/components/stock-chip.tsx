import { Sparkline } from "@/components/sparkline";
import { SentimentBadge } from "@/components/sentiment-badge";
import { cn } from "@/lib/utils";
import type { Quote } from "@/lib/market";
import type { StockMention } from "@/lib/schemas";

export interface StockChipProps {
  mention: Pick<StockMention, "ticker" | "name" | "kind" | "sentiment">;
  quote?: Quote;
  className?: string;
}

/** A dense stock/ETF chip: ticker, price + change, sentiment, and a sparkline. */
export function StockChip({ mention, quote, className }: StockChipProps) {
  const trend = quote ? (quote.changePercent > 0 ? "up" : quote.changePercent < 0 ? "down" : "flat") : "flat";
  const changeColor =
    quote && quote.changePercent > 0
      ? "text-bullish"
      : quote && quote.changePercent < 0
        ? "text-bearish"
        : "text-muted-foreground";

  return (
    <div
      data-testid="stock-chip"
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold">{mention.ticker}</span>
          <span className="truncate text-xs text-muted-foreground">{mention.name}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <SentimentBadge sentiment={mention.sentiment} />
          {quote ? (
            <span className={cn("font-mono text-xs", changeColor)}>
              ${quote.price.toFixed(2)} ({quote.changePercent > 0 ? "+" : ""}
              {quote.changePercent.toFixed(2)}%)
            </span>
          ) : null}
        </div>
      </div>
      {quote ? <Sparkline data={quote.series} trend={trend} className="w-24 shrink-0" /> : null}
    </div>
  );
}
