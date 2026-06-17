"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, ImageIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Thread } from "@/lib/thread";
import { threadToPlainText, webIntentUrl } from "@/lib/thread";

export function ThreadPreview({ thread }: { thread: Thread }) {
  const [copied, setCopied] = useState(false);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(threadToPlainText(thread));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-4" data-testid="thread-preview">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={copyAll}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy thread"}
        </Button>
        <a
          href={webIntentUrl(thread)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          <ExternalLink className="size-4" />
          Open in X
        </a>
        {thread.suggestedHandle ? (
          <Badge variant="secondary" className="font-mono">
            {thread.suggestedHandle}
          </Badge>
        ) : null}
      </div>

      {thread.chartCaption ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          <ImageIcon className="size-4" aria-hidden="true" />
          Suggested media: {thread.chartCaption}
        </div>
      ) : null}

      <ol className="space-y-3">
        {thread.tweets.map((tweet, i) => (
          <li key={i}>
            <Card>
              <CardContent className="flex items-start gap-3 py-3">
                <span className="mt-0.5 font-mono text-xs text-muted-foreground">{i + 1}</span>
                <p className="flex-1 whitespace-pre-wrap text-sm">{tweet.text}</p>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {tweet.text.length}/280
                </span>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
