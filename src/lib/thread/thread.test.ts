import { describe, it, expect } from "vitest";

import { ThreadSchema, TWEET_MAX } from "./types";
import { generateThreadFromTheme, generateThreadFromStatement } from "./generate";
import { DisabledXPoster, webIntentUrl, threadToPlainText } from "./poster";
import { DISCLAIMER_SHORT } from "@/components/disclaimer";
import type { Person, Statement, StockMention, Theme } from "@/lib/schemas";

const theme: Theme = {
  id: "t_x",
  title: "The Multi-Year AI Factory Buildout",
  summary:
    "Hyperscalers and sovereigns are rebuilding data centers around accelerated computing, driving a sustained capex supercycle in GPUs, networking, and infrastructure that is likely to persist for several years as demand keeps outrunning supply across every region.",
  category: "ai-compute",
  confidence: 0.86,
  relatedStatementIds: ["s_1"],
  relatedStockMentionIds: ["m_1"],
};

const mentions: StockMention[] = [
  { id: "m_1", ticker: "NVDA", name: "NVIDIA", kind: "stock", context: "core compute", sentiment: "bullish", sourceStatementId: "s_1" },
  { id: "m_2", ticker: "SMH", name: "VanEck Semi ETF", kind: "etf", context: "basket", sentiment: "bullish", sourceStatementId: "s_1" },
];

const person: Person = {
  id: "p_1",
  name: "Jensen Huang",
  role: "CEO",
  company: "NVIDIA",
  ticker: "NVDA",
  xHandle: "@nvidia",
};

describe("generateThreadFromTheme", () => {
  it("produces a Zod-valid thread with every tweet within the limit", () => {
    const thread = generateThreadFromTheme({ theme, mentions, person });
    expect(() => ThreadSchema.parse(thread)).not.toThrow();
    expect(thread.tweets.length).toBeGreaterThanOrEqual(2);
    for (const t of thread.tweets) {
      expect(t.text.length).toBeLessThanOrEqual(TWEET_MAX);
    }
  });

  it("always includes the disclaimer line and marks disclaimerIncluded", () => {
    const thread = generateThreadFromTheme({ theme, mentions });
    expect(thread.disclaimerIncluded).toBe(true);
    expect(thread.tweets.some((t) => t.text.includes(DISCLAIMER_SHORT))).toBe(true);
  });

  it("lists tickers and is deterministic", () => {
    const a = generateThreadFromTheme({ theme, mentions, person });
    const b = generateThreadFromTheme({ theme, mentions, person });
    expect(a).toEqual(b);
    expect(a.tweets.some((t) => t.text.includes("$NVDA"))).toBe(true);
    expect(a.suggestedHandle).toBe("@nvidia");
  });

  it("splits a long thesis across multiple numbered tweets", () => {
    const thread = generateThreadFromTheme({ theme, mentions });
    expect(thread.tweets[0]?.text).toMatch(/\(1\/\d+\)$/);
  });
});

describe("generateThreadFromStatement", () => {
  it("produces a valid thread including the disclaimer", () => {
    const statement: Statement = {
      id: "s_1",
      personId: "p_1",
      source: "keynote",
      date: "2026-03-18",
      rawText: "Every data center will be rebuilt for accelerated computing.",
      keyQuotes: ["Every data center will be rebuilt for accelerated computing."],
      extractedSignals: [],
    };
    const thread = generateThreadFromStatement({ statement, person, mentions });
    expect(() => ThreadSchema.parse(thread)).not.toThrow();
    expect(thread.sourceType).toBe("statement");
    expect(thread.tweets.some((t) => t.text.includes(DISCLAIMER_SHORT))).toBe(true);
  });
});

describe("poster + helpers", () => {
  it("DisabledXPoster never posts", async () => {
    const poster = new DisabledXPoster();
    expect(poster.enabled).toBe(false);
    const result = await poster.post(generateThreadFromTheme({ theme, mentions }));
    expect(result.posted).toBe(false);
    expect(result.reason).toMatch(/disabled/i);
  });

  it("builds a web-intent URL and plain-text block", () => {
    const thread = generateThreadFromTheme({ theme, mentions });
    expect(webIntentUrl(thread)).toContain("https://twitter.com/intent/tweet?text=");
    expect(threadToPlainText(thread).split("\n\n").length).toBe(thread.tweets.length);
  });
});
