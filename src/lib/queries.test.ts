import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { MemoryStore } from "@/lib/db/memory-store";
import { __setDataStoreForTests } from "@/lib/db";
import { FixtureMarketProvider } from "@/lib/market/fixture-provider";
import { __setMarketProviderForTests } from "@/lib/market";
import {
  getExecsWithLatest,
  getMentionsWithQuotes,
  getTopMentions,
  getThemeWithMentions,
} from "./queries";

describe("queries (data wiring)", () => {
  beforeEach(() => {
    __setDataStoreForTests(new MemoryStore());
    __setMarketProviderForTests(new FixtureMarketProvider());
  });

  afterEach(() => {
    __setDataStoreForTests(null);
    __setMarketProviderForTests(null);
  });

  it("pairs each exec with their latest statement", async () => {
    const execs = await getExecsWithLatest();
    expect(execs).toHaveLength(5);
    const jensen = execs.find((e) => e.person.id === "p_jensen_huang");
    expect(jensen?.latestStatement).toBeDefined();
    // Latest = most recent date among Jensen's statements.
    expect(jensen?.latestStatement?.date).toBe("2026-03-18");
  });

  it("enriches mentions with deterministic quotes", async () => {
    const mentions = await getTopMentions(6);
    const enriched = await getMentionsWithQuotes(mentions);
    expect(enriched.length).toBe(mentions.length);
    const nvda = enriched.find((e) => e.mention.ticker === "NVDA");
    expect(nvda?.quote?.series.length).toBe(30);
  });

  it("returns distinct tickers from getTopMentions", async () => {
    const mentions = await getTopMentions(10);
    const tickers = mentions.map((m) => m.ticker);
    expect(new Set(tickers).size).toBe(tickers.length);
  });

  it("resolves a theme with its related mentions", async () => {
    const data = await getThemeWithMentions("t_ai_factory_buildout");
    expect(data).not.toBeNull();
    expect(data!.theme.title).toContain("AI Factory");
    expect(data!.mentions.length).toBeGreaterThan(0);
    expect(data!.mentions.every((m) => m.id.startsWith("m_"))).toBe(true);
  });

  it("returns null for an unknown theme", async () => {
    expect(await getThemeWithMentions("t_nope")).toBeNull();
  });
});
