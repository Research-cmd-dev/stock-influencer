import { describe, it, expect, beforeEach } from "vitest";

import { MemoryStore } from "@/lib/db/memory-store";
import { ingestItems, ingestFromSource } from "./ingest";
import { FixtureSource } from "./fixture-source";
import type { RawSourceItem } from "./types";

function rawItem(overrides: Partial<RawSourceItem> = {}): RawSourceItem {
  return {
    personId: "p_jensen_huang",
    source: "interview",
    publishedAt: "2026-05-10",
    text: "A fresh statement about AI compute demand.",
    ...overrides,
  };
}

describe("ingestItems", () => {
  let store: MemoryStore;

  beforeEach(() => {
    // Empty store so counts are unambiguous.
    store = new MemoryStore({ seed: false });
  });

  it("validates, dedupes within a batch, and persists new statements", async () => {
    const dup = rawItem();
    const result = await ingestItems(store, [dup, rawItem({ ...dup }), rawItem({ text: "Another distinct statement entirely." })]);

    expect(result.ingested).toHaveLength(2);
    expect(result.duplicates).toBe(1);
    expect(result.rejected).toHaveLength(0);
    expect(await store.listStatements()).toHaveLength(2);
  });

  it("dedupes against statements already in the store", async () => {
    const first = await ingestItems(store, [rawItem()]);
    expect(first.ingested).toHaveLength(1);

    const second = await ingestItems(store, [rawItem()]);
    expect(second.ingested).toHaveLength(0);
    expect(second.duplicates).toBe(1);
    expect(await store.listStatements()).toHaveLength(1);
  });

  it("rejects invalid items and logs the reason, without poisoning the batch", async () => {
    const result = await ingestItems(store, [
      rawItem({ text: "" }), // invalid: empty text
      rawItem({ url: "not-a-url" }), // invalid: bad URL
      rawItem({ text: "Perfectly valid statement here." }), // valid
    ]);

    expect(result.rejected).toHaveLength(2);
    expect(result.ingested).toHaveLength(1);
    expect(result.rejected[0]?.reason).toBeTruthy();
  });

  it("ingests a fixture batch end to end, deduping the planted duplicate", async () => {
    const result = await ingestFromSource(store, new FixtureSource());
    // Fixture has 3 items, two of which are duplicates of each other.
    expect(result.ingested).toHaveLength(2);
    expect(result.duplicates).toBe(1);
  });
});
