import { describe, it, expect, beforeEach } from "vitest";

import { MemoryStore } from "@/lib/db/memory-store";
import { AnalysisResultSchema } from "./types";
import { MockLLMClient } from "./mock-client";
import { analyzeAndPersistStatement, analyzeStatements } from "./analyze";
import type { Person, Statement } from "@/lib/schemas";

const person: Person = {
  id: "p_jensen_huang",
  name: "Jensen Huang",
  role: "CEO",
  company: "NVIDIA",
  ticker: "NVDA",
};

function statement(overrides: Partial<Statement> = {}): Statement {
  return {
    id: "s_test",
    personId: "p_jensen_huang",
    source: "keynote",
    date: "2026-03-18",
    rawText:
      "Demand for our Blackwell GPU platform far exceeds supply as every data center is rebuilt for accelerated computing.",
    keyQuotes: ["Demand far exceeds supply."],
    extractedSignals: [],
    ...overrides,
  };
}

describe("MockLLMClient", () => {
  it("returns output that passes Zod validation", async () => {
    const llm = new MockLLMClient();
    const { result, usage } = await llm.analyzeStatement(statement(), person);
    expect(() => AnalysisResultSchema.parse(result)).not.toThrow();
    expect(usage.inputTokens).toBeGreaterThan(0);
  });

  it("is deterministic for the same input", async () => {
    const llm = new MockLLMClient();
    const a = await llm.analyzeStatement(statement(), person);
    const b = await llm.analyzeStatement(statement(), person);
    expect(b.result).toEqual(a.result);
  });

  it("surfaces the executive's own ticker and detects bullish sentiment", async () => {
    const llm = new MockLLMClient();
    const { result } = await llm.analyzeStatement(statement(), person);
    const tickers = result.stockMentions.map((m) => m.ticker);
    expect(tickers).toContain("NVDA");
    expect(result.stockMentions.every((m) => m.sentiment === "bullish")).toBe(true);
    expect(result.themes.length).toBeGreaterThan(0);
  });
});

describe("analyzeAndPersistStatement", () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore({ seed: false });
  });

  it("persists signals, mentions, and linked themes", async () => {
    await store.createPerson(person);
    // createPerson assigns a new id; insert a statement referencing the seeded fixture id instead.
    const seeded = new MemoryStore();
    const stmt = (await seeded.listStatements({ personId: "p_jensen_huang" }))[0]!;

    const outcome = await analyzeAndPersistStatement(seeded, new MockLLMClient(), stmt);

    expect(outcome.signalsCount).toBeGreaterThan(0);
    expect(outcome.stockMentions.length).toBeGreaterThan(0);
    expect(outcome.themes.length).toBeGreaterThan(0);

    // Signals were written back onto the statement.
    const reloaded = await seeded.getStatement(stmt.id);
    expect(reloaded?.extractedSignals.length).toBe(outcome.signalsCount);

    // Themes link back to the statement and to the created mentions.
    for (const theme of outcome.themes) {
      const persisted = await seeded.getTheme(theme.id);
      expect(persisted?.relatedStatementIds).toContain(stmt.id);
      expect(persisted?.relatedStockMentionIds).toEqual(outcome.stockMentions.map((m) => m.id));
    }
  });
});

describe("analyzeStatements (batch)", () => {
  it("accumulates usage and tolerates per-item failures", async () => {
    const store = new MemoryStore();
    const statements = await store.listStatements();
    const summary = await analyzeStatements(store, new MockLLMClient(), statements);
    expect(summary.analyzed).toBe(statements.length);
    expect(summary.failed).toBe(0);
    expect(summary.totalThemes).toBeGreaterThan(0);
  });

  it("counts a failure when the person is missing", async () => {
    const store = new MemoryStore({ seed: false });
    const orphan = statement({ id: "s_orphan", personId: "p_missing" });
    const summary = await analyzeStatements(store, new MockLLMClient(), [orphan]);
    expect(summary.failed).toBe(1);
    expect(summary.analyzed).toBe(0);
  });
});
