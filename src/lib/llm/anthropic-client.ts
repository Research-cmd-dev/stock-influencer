import Anthropic from "@anthropic-ai/sdk";

import { getEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { ExternalServiceError, ValidationError } from "@/lib/errors";
import type { Person, Statement } from "@/lib/schemas";
import { AnalysisResultSchema, type AnalyzeResponse, type LLMClient } from "@/lib/llm/types";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/llm/prompts";

/**
 * Default model for theme + stock extraction, per CLAUDE.md. Sonnet 4.6 balances
 * cost and quality for structured extraction.
 */
export const ANALYSIS_MODEL = "claude-sonnet-4-6";

/** Per-MTok pricing for cost logging (USD). */
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-6": { input: 3, output: 15 },
};

const MAX_RETRIES = 3;
const TIMEOUT_MS = 60_000;

function estimateCost(model: string, inputTokens: number, outputTokens: number): number | undefined {
  const p = PRICING[model];
  if (!p) return undefined;
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}

/** Strip markdown code fences and isolate the first JSON object in a string. */
function extractJson(text: string): unknown {
  const fenced = text.replace(/```(?:json)?/gi, "").trim();
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new ValidationError("LLM response contained no JSON object");
  }
  try {
    return JSON.parse(fenced.slice(start, end + 1));
  } catch (err) {
    throw new ValidationError("LLM response was not valid JSON", { cause: err });
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Real analysis engine backed by the Anthropic SDK. Uses retry-with-backoff,
 * a per-request timeout, Zod validation of the structured output, and per-call
 * cost/usage logging. Selected only when LLM_BACKEND=anthropic and a key is set.
 */
export class AnthropicLLMClient implements LLMClient {
  readonly id = "anthropic";
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(options: { apiKey?: string; model?: string } = {}) {
    const env = getEnv();
    const apiKey = options.apiKey ?? env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new ExternalServiceError("ANTHROPIC_API_KEY is not set (use LLM_BACKEND=mock to run offline).");
    }
    this.client = new Anthropic({ apiKey, timeout: TIMEOUT_MS, maxRetries: 0 });
    this.model = options.model ?? ANALYSIS_MODEL;
  }

  async analyzeStatement(statement: Statement, person: Person): Promise<AnalyzeResponse> {
    const log = logger.child({ component: "AnthropicLLMClient", statementId: statement.id });

    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const started = Date.now();
        const message = await this.client.messages.create({
          model: this.model,
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildUserPrompt(statement, person) }],
        });

        const text = message.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n");

        const result = AnalysisResultSchema.parse(extractJson(text));

        const inputTokens = message.usage.input_tokens;
        const outputTokens = message.usage.output_tokens;
        const estimatedCostUsd = estimateCost(this.model, inputTokens, outputTokens);

        log.info("LLM analysis succeeded", {
          model: this.model,
          attempt,
          durationMs: Date.now() - started,
          inputTokens,
          outputTokens,
          estimatedCostUsd,
        });

        return { result, usage: { inputTokens, outputTokens, estimatedCostUsd } };
      } catch (err) {
        lastError = err;
        // Validation errors are not transient — fail fast.
        if (err instanceof ValidationError) {
          log.error("LLM output failed validation", { attempt, error: err });
          throw err;
        }
        const backoffMs = 2 ** attempt * 500;
        log.warn("LLM call failed; will retry", { attempt, backoffMs, error: err });
        if (attempt < MAX_RETRIES) await sleep(backoffMs);
      }
    }

    throw new ExternalServiceError("LLM analysis failed after retries", { cause: lastError });
  }
}
