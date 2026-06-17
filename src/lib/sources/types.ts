import { z } from "zod";

import { StatementSourceTypeSchema } from "@/lib/schemas";

/**
 * A raw item emitted by an ingestion source, before it becomes a Statement.
 * Sources parse their native format (RSS, transcript, etc.) into this shape;
 * the ingestion pipeline validates and maps it into a StatementInput.
 */
export const RawSourceItemSchema = z.object({
  /** Stable id from the upstream source, if any (used for logging/traceability). */
  externalId: z.string().optional(),
  /** Which tracked person this item is attributed to. */
  personId: z.string().min(1),
  source: StatementSourceTypeSchema,
  title: z.string().min(1).optional(),
  url: z.string().url().optional(),
  /** Publication date (ISO-8601 or YYYY-MM-DD). */
  publishedAt: z.string().min(1),
  /** The full text/body of the statement. */
  text: z.string().min(1),
});

export type RawSourceItem = z.infer<typeof RawSourceItemSchema>;

/**
 * An ingestion source adapter. Real adapters (RSS/news, transcripts) and the
 * fixture adapter both implement this so the pipeline is source-agnostic.
 */
export interface SourceAdapter {
  /** Stable identifier for the adapter (for logs). */
  readonly id: string;
  /** Fetch and normalize the latest items from this source. */
  fetchItems(): Promise<RawSourceItem[]>;
}
