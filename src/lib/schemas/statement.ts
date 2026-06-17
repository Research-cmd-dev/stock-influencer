import { z } from "zod";
import { IdSchema, IsoDateSchema, UrlSchema, StatementSourceTypeSchema } from "./common";

/** A single extracted signal (a discrete, investable observation) from a statement. */
export const ExtractedSignalSchema = z.object({
  text: z.string().min(1),
  category: z.string().min(1),
  rationale: z.string().optional(),
});
export type ExtractedSignal = z.infer<typeof ExtractedSignalSchema>;

/** A public statement made by a tracked executive. */
export const StatementSchema = z.object({
  id: IdSchema,
  personId: IdSchema,
  source: StatementSourceTypeSchema,
  sourceUrl: UrlSchema.optional(),
  title: z.string().min(1).optional(),
  date: IsoDateSchema,
  rawText: z.string().min(1),
  keyQuotes: z.array(z.string().min(1)).default([]),
  extractedSignals: z.array(ExtractedSignalSchema).default([]),
  /** Hash used for ingestion dedupe (computed from personId + source + normalized text). */
  dedupeHash: z.string().min(1).optional(),
  createdAt: IsoDateSchema.optional(),
});

export type Statement = z.infer<typeof StatementSchema>;

/** Shape for ingesting a statement (id + derived fields assigned by the store/pipeline). */
export const StatementInputSchema = StatementSchema.omit({
  id: true,
  extractedSignals: true,
  dedupeHash: true,
  createdAt: true,
}).extend({
  keyQuotes: z.array(z.string().min(1)).default([]),
});
export type StatementInput = z.infer<typeof StatementInputSchema>;
