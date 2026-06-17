import { describe, it, expect } from "vitest";

import { FixtureMarketProvider } from "./fixture-provider";
import { QuoteSchema } from "./types";

describe("FixtureMarketProvider", () => {
  const provider = new FixtureMarketProvider();

  it("returns a Zod-valid, deterministic quote", async () => {
    const a = await provider.getQuote("NVDA");
    const b = await provider.getQuote("nvda");
    expect(a).not.toBeNull();
    expect(() => QuoteSchema.parse(a)).not.toThrow();
    expect(a!.series).toHaveLength(30);
    expect(b).toEqual(a); // case-insensitive + deterministic
  });

  it("returns null for an unknown ticker", async () => {
    expect(await provider.getQuote("ZZZZ")).toBeNull();
  });

  it("batches quotes, skipping unknown tickers", async () => {
    const quotes = await provider.getQuotes(["NVDA", "AMD", "ZZZZ"]);
    expect(Object.keys(quotes).sort()).toEqual(["AMD", "NVDA"]);
  });
});
