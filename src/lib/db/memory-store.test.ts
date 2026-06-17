import { describe, it, expect, beforeEach } from "vitest";

import { MemoryStore } from "./memory-store";
import { ValidationError } from "@/lib/errors";
import { statementDedupeHash } from "@/lib/hash";

describe("MemoryStore (fixture data-access layer)", () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  it("seeds 5 executives sorted by name", async () => {
    const people = await store.listPeople();
    expect(people).toHaveLength(5);
    const names = people.map((p) => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("returns null for an unknown person", async () => {
    expect(await store.getPerson("does-not-exist")).toBeNull();
  });

  it("lists statements newest-first and filters by person", async () => {
    const all = await store.listStatements();
    expect(all.length).toBeGreaterThan(0);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1]!.date >= all[i]!.date).toBe(true);
    }
    const jensen = await store.listStatements({ personId: "p_jensen_huang" });
    expect(jensen.every((s) => s.personId === "p_jensen_huang")).toBe(true);
  });

  it("orders themes by descending confidence", async () => {
    const themes = await store.listThemes();
    for (let i = 1; i < themes.length; i++) {
      expect(themes[i - 1]!.confidence >= themes[i]!.confidence).toBe(true);
    }
  });

  it("filters stock mentions by ticker (case-insensitive) and statement", async () => {
    const byTicker = await store.listStockMentions({ ticker: "nvda" });
    expect(byTicker.length).toBeGreaterThan(0);
    expect(byTicker.every((m) => m.ticker === "NVDA")).toBe(true);

    const byStatement = await store.listStockMentions({ statementId: "s_jensen_gtc_2026" });
    expect(byStatement.every((m) => m.sourceStatementId === "s_jensen_gtc_2026")).toBe(true);
  });

  it("creates a statement, assigns ids + dedupe hash, and is retrievable", async () => {
    const created = await store.createStatement({
      personId: "p_lisa_su",
      source: "interview",
      date: "2026-04-01",
      rawText: "We are investing heavily in our AI software ecosystem.",
      keyQuotes: [],
    });
    expect(created.id).toMatch(/^s_/);
    expect(created.dedupeHash).toBe(
      statementDedupeHash({
        personId: "p_lisa_su",
        source: "interview",
        rawText: "We are investing heavily in our AI software ecosystem.",
      }),
    );
    const found = await store.findStatementByDedupeHash(created.dedupeHash!);
    expect(found?.id).toBe(created.id);
  });

  it("rejects invalid input with a ValidationError", async () => {
    await expect(
      // @ts-expect-error — intentionally invalid: missing required fields
      store.createPerson({ name: "" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("supports an empty (unseeded) store", async () => {
    const empty = new MemoryStore({ seed: false });
    expect(await empty.listPeople()).toHaveLength(0);
    expect(await empty.listStatements()).toHaveLength(0);
  });

  it("scopes watchlists and alerts to their user", async () => {
    const wl = await store.createWatchlist({
      userId: "u_1",
      name: "AI compute",
      tickers: ["NVDA", "AMD"],
      personIds: [],
    });
    expect(wl.id).toMatch(/^w_/);
    expect(await store.listWatchlists("u_1")).toHaveLength(1);
    expect(await store.listWatchlists("u_2")).toHaveLength(0);

    await store.createAlert({
      userId: "u_1",
      watchlistId: wl.id,
      rule: { type: "new-statement", ticker: "NVDA" },
      status: "pending",
      message: "New NVDA-related statement.",
    });
    expect(await store.listAlerts("u_1")).toHaveLength(1);
    expect(await store.listAlerts("u_2")).toHaveLength(0);
  });
});
