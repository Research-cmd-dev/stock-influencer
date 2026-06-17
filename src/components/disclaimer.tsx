import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

/** The exact, non-negotiable disclaimer text. Referenced by tests. */
export const DISCLAIMER_TEXT =
  "This is for informational purposes only and is not financial advice.";

/** Short variant for space-constrained surfaces (e.g. generated X threads). */
export const DISCLAIMER_SHORT = "Informational only — not financial advice.";

type DisclaimerVariant = "banner" | "inline";

export interface DisclaimerProps {
  variant?: DisclaimerVariant;
  className?: string;
}

/**
 * Shared financial disclaimer. MUST render on every surface that shows tickers,
 * themes, sentiment, or "stocks to watch". This is a hard product gate.
 */
export function Disclaimer({ variant = "banner", className }: DisclaimerProps) {
  if (variant === "inline") {
    return (
      <p
        data-testid="disclaimer"
        className={cn("text-xs leading-relaxed text-muted-foreground", className)}
      >
        {DISCLAIMER_TEXT}
      </p>
    );
  }

  return (
    <aside
      role="note"
      data-testid="disclaimer"
      className={cn(
        "flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{DISCLAIMER_TEXT}</span>
    </aside>
  );
}
