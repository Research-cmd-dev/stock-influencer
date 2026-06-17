import { z } from "zod";
import { IdSchema, IsoDateSchema, ConfidenceSchema, ThemeCategorySchema } from "./common";

/** A clustered investment theme synthesized from related statements. */
export const ThemeSchema = z.object({
  id: IdSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  category: ThemeCategorySchema,
  confidence: ConfidenceSchema,
  relatedStatementIds: z.array(IdSchema).default([]),
  relatedStockMentionIds: z.array(IdSchema).default([]),
  updatedAt: IsoDateSchema.optional(),
});

export type Theme = z.infer<typeof ThemeSchema>;

/** Shape for creating a theme (id assigned by the store). */
export const ThemeInputSchema = ThemeSchema.omit({ id: true });
export type ThemeInput = z.infer<typeof ThemeInputSchema>;
