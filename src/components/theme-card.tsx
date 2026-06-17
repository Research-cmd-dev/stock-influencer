import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Theme } from "@/lib/schemas";

const CATEGORY_LABELS: Record<Theme["category"], string> = {
  "ai-compute": "AI Compute",
  "data-centers": "Data Centers",
  "chips-semis": "Chips & Semis",
  infrastructure: "Infrastructure",
  software: "Software",
  "energy-power": "Energy & Power",
  other: "Other",
};

export function ThemeCard({ theme, className }: { theme: Theme; className?: string }) {
  const pct = Math.round(theme.confidence * 100);
  return (
    <Card className={cn("group transition-colors hover:border-primary/40", className)}>
      <Link href={`/themes/${theme.id}`} className="block">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">
              {CATEGORY_LABELS[theme.category]}
            </Badge>
            <div className="flex items-center gap-1.5" title={`Confidence: ${pct}%`}>
              <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
            </div>
          </div>
          <CardTitle className="text-base leading-snug">{theme.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-3">{theme.summary}</CardDescription>
        </CardContent>
      </Link>
    </Card>
  );
}
