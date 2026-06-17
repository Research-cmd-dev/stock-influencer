import { z } from "zod";

import {
  ExtractedSignalSchema,
  SentimentSchema,
  InstrumentKindSchema,
  ThemeCategorySchema,
  ConfidenceSchema,
  type Person,
  type Statement,
} from "@/lib/schemas";

/**
 * Structured output the analysis engine must return. Every field is Zod-validated
 * before anything is persisted — the LLM boundary is treated as untrusted.
 */
export const StockMentionDraftSchema = z.object({
  ticker: z.string().min(1).max(8),
  name: z.string().min(1),
  kind: InstrumentKindSchema,
  context: z.string().min(1),
  sentiment: SentimentSchema,
});
export type StockMentionDraft = z.infer<typeof StockMentionDraftSchema>;

export const ThemeDraftSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  category: ThemeCategorySchema,
  confidence: ConfidenceSchema,
});
export type ThemeDraft = z.infer<typeof ThemeDraftSchema>;

export const AnalysisResultSchema = z.object({
  signals: z.array(ExtractedSignalSchema).default([]),
  stockMentions: z.array(StockMentionDraftSchema).default([]),
  themes: z.array(ThemeDraftSchema).default([]),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

/** Token/cost usage for a single LLM call (logged per call). */
export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
  /** Estimated cost in USD, if computable from the model's pricing. */
  estimatedCostUsd?: number;
}

export interface AnalyzeResponse {
  result: AnalysisResult;
  usage: LlmUsage;
}

/**
 * The analysis-engine contract. Real impl uses the Anthropic SDK; the mock is
 * deterministic. Both validate output with Zod before returning.
 */
export interface LLMClient {
  readonly id: string;
  analyzeStatement(statement: Statement, person: Person): Promise<AnalyzeResponse>;
}
