import { getEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { LLMClient } from "@/lib/llm/types";
import { MockLLMClient } from "@/lib/llm/mock-client";
import { AnthropicLLMClient } from "@/lib/llm/anthropic-client";

export type {
  LLMClient,
  AnalysisResult,
  AnalyzeResponse,
  LlmUsage,
  StockMentionDraft,
  ThemeDraft,
} from "@/lib/llm/types";
export { AnalysisResultSchema } from "@/lib/llm/types";
export { MockLLMClient } from "@/lib/llm/mock-client";
export { AnthropicLLMClient, ANALYSIS_MODEL } from "@/lib/llm/anthropic-client";
export {
  analyzeAndPersistStatement,
  analyzeStatements,
  type AnalyzeStatementOutcome,
  type BatchAnalysisSummary,
} from "@/lib/llm/analyze";

let singleton: LLMClient | null = null;

/**
 * Resolve the active LLM client from LLM_BACKEND. Defaults to the deterministic
 * mock so the app and tests run with zero credentials. The Anthropic client is
 * only constructed when explicitly selected.
 */
export function getLLMClient(): LLMClient {
  if (singleton) return singleton;

  const env = getEnv();
  if (env.LLM_BACKEND === "anthropic") {
    logger.info("Using Anthropic LLM backend");
    singleton = new AnthropicLLMClient();
  } else {
    logger.info("Using mock LLM backend");
    singleton = new MockLLMClient();
  }
  return singleton;
}

/** Test helper: override the active LLM client. */
export function __setLLMClientForTests(client: LLMClient | null): void {
  singleton = client;
}
