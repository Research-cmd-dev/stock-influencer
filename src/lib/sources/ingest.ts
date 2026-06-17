import { logger } from "@/lib/logger";
import { toErrorMessage } from "@/lib/errors";
import { statementDedupeHash } from "@/lib/hash";
import type { DataStore } from "@/lib/db";
import { type Statement, type StatementInput, StatementInputSchema } from "@/lib/schemas";
import { RawSourceItemSchema, type RawSourceItem, type SourceAdapter } from "@/lib/sources/types";

export interface IngestResult {
  /** Newly-persisted statements. */
  ingested: Statement[];
  /** Count of items skipped because an identical statement already exists. */
  duplicates: number;
  /** Items rejected by validation, with the reason (logged too). */
  rejected: Array<{ item: unknown; reason: string }>;
}

/** Map a validated raw item into a StatementInput. */
function toStatementInput(item: RawSourceItem): StatementInput {
  return {
    personId: item.personId,
    source: item.source,
    sourceUrl: item.url,
    title: item.title,
    date: item.publishedAt,
    rawText: item.text,
    keyQuotes: [],
  };
}

/**
 * Ingest raw items into the store: validate at the boundary (Zod), dedupe by
 * content hash (both against the store and within the batch), and persist new
 * statements. Never throws on a single bad item — it is collected in `rejected`
 * and logged, so a bad item can't poison the batch.
 */
export async function ingestItems(
  store: DataStore,
  rawItems: RawSourceItem[],
): Promise<IngestResult> {
  const result: IngestResult = { ingested: [], duplicates: 0, rejected: [] };
  const seenInBatch = new Set<string>();

  for (const raw of rawItems) {
    // 1. Boundary validation.
    const parsedRaw = RawSourceItemSchema.safeParse(raw);
    if (!parsedRaw.success) {
      const reason = parsedRaw.error.message;
      logger.warn("Rejected raw source item (invalid shape)", { reason });
      result.rejected.push({ item: raw, reason });
      continue;
    }

    const input = toStatementInput(parsedRaw.data);

    // The StatementInput must also be valid (e.g. URL well-formed, date parseable).
    const parsedInput = StatementInputSchema.safeParse(input);
    if (!parsedInput.success) {
      const reason = parsedInput.error.message;
      logger.warn("Rejected statement input", { reason });
      result.rejected.push({ item: raw, reason });
      continue;
    }

    // 2. Dedupe.
    const hash = statementDedupeHash({
      personId: parsedInput.data.personId,
      source: parsedInput.data.source,
      rawText: parsedInput.data.rawText,
    });

    if (seenInBatch.has(hash)) {
      result.duplicates += 1;
      continue;
    }
    seenInBatch.add(hash);

    const existing = await store.findStatementByDedupeHash(hash);
    if (existing) {
      result.duplicates += 1;
      continue;
    }

    // 3. Persist.
    try {
      const created = await store.createStatement(parsedInput.data);
      result.ingested.push(created);
    } catch (err) {
      const reason = toErrorMessage(err);
      logger.error("Failed to persist statement during ingest", { reason });
      result.rejected.push({ item: raw, reason });
    }
  }

  logger.info("Ingest complete", {
    ingested: result.ingested.length,
    duplicates: result.duplicates,
    rejected: result.rejected.length,
  });
  return result;
}

/** Fetch from a source adapter and ingest the resulting items. */
export async function ingestFromSource(
  store: DataStore,
  source: SourceAdapter,
): Promise<IngestResult> {
  logger.info("Ingesting from source", { source: source.id });
  const items = await source.fetchItems();
  return ingestItems(store, items);
}
