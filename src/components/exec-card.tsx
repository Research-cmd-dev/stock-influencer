import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Person, Statement } from "@/lib/schemas";

export interface ExecCardProps {
  person: Person;
  latestStatement?: Statement;
}

/** Executive card: identity + their latest thesis, links to the exec timeline. */
export function ExecCard({ person, latestStatement }: ExecCardProps) {
  const thesis = latestStatement?.keyQuotes[0] ?? latestStatement?.rawText.slice(0, 140);

  return (
    <Card className="group transition-colors hover:border-primary/40">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-sm font-semibold text-secondary-foreground"
            >
              {person.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <CardTitle className="text-base">{person.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {person.role} · {person.company}
              </p>
            </div>
          </div>
          {person.ticker ? (
            <Badge variant="secondary" className="font-mono">
              {person.ticker}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {thesis ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">&ldquo;{thesis}&rdquo;</p>
        ) : (
          <p className="text-sm text-muted-foreground">No statements yet.</p>
        )}
        <Link
          href={`/exec/${person.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View timeline
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
