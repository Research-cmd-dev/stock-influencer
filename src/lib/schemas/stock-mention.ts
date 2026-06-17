import { z } from "zod";
import { IdSchema, InstrumentKindSchema, SentimentSchema } from "./common";

/** A reference to a company/ETF surfaced from a statement. */
export const StockMentionSchema = z.object({
  id: IdSchema,
  ticker: z.string().min(1).max(8).toUpperCase(),
  name: z.string().min(1),
  kind: InstrumentKindSchema,
  context: z.string().min(1),
  sentiment: SentimentSchema,
  sourceStatementId: IdSchema,
});

export type StockMention = z.infer<typeof StockMentionSchema>;

/** Shape for creating a stock mention (id assigned by the store). */
export const StockMentionInputSchema = StockMentionSchema.omit({ id: true });
export type StockMentionInput = z.infer<typeof StockMentionInputSchema>;
