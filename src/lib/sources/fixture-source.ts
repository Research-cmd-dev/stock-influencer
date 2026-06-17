import type { RawSourceItem, SourceAdapter } from "@/lib/sources/types";

/**
 * Deterministic fixture source. Yields a small batch of raw items — including an
 * intentional duplicate and one item attributed to a person already in the seed —
 * so the ingestion pipeline's validation + dedupe paths are exercised end to end.
 */
const FIXTURE_ITEMS: RawSourceItem[] = [
  {
    externalId: "fx-001",
    personId: "p_jensen_huang",
    source: "interview",
    title: "Jensen on inference economics",
    url: "https://example.com/jensen-inference",
    publishedAt: "2026-05-02",
    text: "Inference is becoming the dominant workload. The economics of token generation will define the next phase of the AI buildout.",
  },
  {
    externalId: "fx-002",
    personId: "p_lisa_su",
    source: "article",
    title: "AMD's data-center roadmap",
    url: "https://example.com/amd-roadmap",
    publishedAt: "2026-05-04",
    text: "Our annual cadence of data-center GPUs gives customers a predictable roadmap and a real alternative in AI compute.",
  },
  {
    // Duplicate of fx-001 (same person + source + text) — must be deduped.
    externalId: "fx-001-dup",
    personId: "p_jensen_huang",
    source: "interview",
    title: "Re-post: Jensen on inference economics",
    publishedAt: "2026-05-03",
    text: "Inference is becoming the dominant workload. The economics of token generation will define the next phase of the AI buildout.",
  },
];

export class FixtureSource implements SourceAdapter {
  readonly id = "fixture";

  constructor(private readonly items: RawSourceItem[] = FIXTURE_ITEMS) {}

  async fetchItems(): Promise<RawSourceItem[]> {
    return this.items;
  }
}

export const FIXTURE_SOURCE_ITEMS = FIXTURE_ITEMS;
