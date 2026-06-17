import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Sentiment } from "@/lib/schemas";

const CONFIG: Record<Sentiment, { variant: "bullish" | "bearish" | "neutral"; Icon: typeof TrendingUp }> = {
  bullish: { variant: "bullish", Icon: TrendingUp },
  bearish: { variant: "bearish", Icon: TrendingDown },
  neutral: { variant: "neutral", Icon: Minus },
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const { variant, Icon } = CONFIG[sentiment];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="size-3" aria-hidden="true" />
      <span className="capitalize">{sentiment}</span>
    </Badge>
  );
}
