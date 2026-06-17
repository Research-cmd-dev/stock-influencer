import { describe, it, expect } from "vitest";

import {
  PersonSchema,
  StatementSchema,
  ThemeSchema,
  StockMentionSchema,
  UserWatchlistSchema,
  AlertSchema,
} from "./index";

describe("core data-contract schemas", () => {
  it("parses a valid Person and rejects an empty name", () => {
    const person = PersonSchema.parse({
      id: "p_jensen",
      name: "Jensen Huang",
      role: "CEO",
      company: "NVIDIA",
      ticker: "NVDA",
      xHandle: "@nvidia",
    });
    expect(person.name).toBe("Jensen Huang");
    expect(PersonSchema.safeParse({ id: "x", name: "", role: "CEO", company: "NVIDIA" }).success).toBe(
      false,
    );
  });

  it("applies defaults for Statement arrays", () => {
    const statement = StatementSchema.parse({
      id: "s_1",
      personId: "p_jensen",
      source: "keynote",
      date: "2026-01-15",
      rawText: "Accelerated computing has reached a tipping point.",
    });
    expect(statement.keyQuotes).toEqual([]);
    expect(statement.extractedSignals).toEqual([]);
  });

  it("uppercases tickers in StockMention", () => {
    const mention = StockMentionSchema.parse({
      id: "m_1",
      ticker: "nvda",
      name: "NVIDIA",
      kind: "stock",
      context: "Mentioned as the core compute platform.",
      sentiment: "bullish",
      sourceStatementId: "s_1",
    });
    expect(mention.ticker).toBe("NVDA");
  });

  it("bounds Theme confidence to [0,1]", () => {
    expect(
      ThemeSchema.safeParse({
        id: "t_1",
        title: "AI Compute Buildout",
        summary: "Demand for accelerated compute keeps outrunning supply.",
        category: "ai-compute",
        confidence: 1.5,
      }).success,
    ).toBe(false);
  });

  it("parses watchlist and alert shapes", () => {
    const watchlist = UserWatchlistSchema.parse({ id: "w_1", userId: "u_1" });
    expect(watchlist.name).toBe("My Watchlist");

    const alert = AlertSchema.parse({
      id: "a_1",
      userId: "u_1",
      watchlistId: "w_1",
      rule: { type: "new-theme" },
      message: "A new theme touches your watchlist.",
    });
    expect(alert.status).toBe("pending");
  });
});
