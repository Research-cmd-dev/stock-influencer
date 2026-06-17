import { z } from "zod";

/** A stable identifier (uuid or slug-like). Kept permissive for fixtures. */
export const IdSchema = z.string().min(1, "id must not be empty");

/** ISO-8601 timestamp string. */
export const IsoDateSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD"));

/** A URL (http/https). */
export const UrlSchema = z.string().url();

/** Sentiment of a stock mention or signal. */
export const SentimentSchema = z.enum(["bullish", "bearish", "neutral"]);
export type Sentiment = z.infer<typeof SentimentSchema>;

/** A confidence score in [0, 1]. */
export const ConfidenceSchema = z.number().min(0).max(1);

/** Theme categories aligned with the product's investment lenses. */
export const ThemeCategorySchema = z.enum([
  "ai-compute",
  "data-centers",
  "chips-semis",
  "infrastructure",
  "software",
  "energy-power",
  "other",
]);
export type ThemeCategory = z.infer<typeof ThemeCategorySchema>;

/** Kind of tradable instrument referenced in a statement. */
export const InstrumentKindSchema = z.enum(["stock", "etf"]);
export type InstrumentKind = z.infer<typeof InstrumentKindSchema>;

/** Where a statement originated. */
export const StatementSourceTypeSchema = z.enum([
  "transcript",
  "interview",
  "keynote",
  "tweet",
  "article",
  "press-release",
  "manual",
]);
export type StatementSourceType = z.infer<typeof StatementSourceTypeSchema>;
