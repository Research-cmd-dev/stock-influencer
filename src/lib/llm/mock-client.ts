import type { Person, Statement, ThemeCategory } from "@/lib/schemas";
import { AnalysisResultSchema, type AnalyzeResponse, type LLMClient } from "@/lib/llm/types";

/** Keyword → theme category map used to derive deterministic themes. */
const CATEGORY_KEYWORDS: Array<{ category: ThemeCategory; title: string; words: string[] }> = [
  { category: "ai-compute", title: "AI Compute Demand", words: ["ai", "inference", "training", "accelerated computing", "ai factory"] },
  { category: "data-centers", title: "Data-Center Buildout", words: ["data center", "data-center", "capacity", "capex", "footprint"] },
  { category: "chips-semis", title: "Semiconductor Cycle", words: ["gpu", "chip", "silicon", "blackwell", "mi400", "tpu", "trainium", "accelerator"] },
  { category: "infrastructure", title: "AI Infrastructure", words: ["networking", "nvlink", "spectrum", "infrastructure"] },
  { category: "energy-power", title: "Power Constraint", words: ["power", "energy", "electricity", "grid"] },
  { category: "software", title: "Software & Platforms", words: ["software", "rocm", "cuda", "platform", "ecosystem"] },
];

/** A small ticker dictionary so the mock can surface mentions deterministically. */
const TICKER_DICTIONARY: Array<{ ticker: string; name: string; kind: "stock" | "etf"; words: string[] }> = [
  { ticker: "NVDA", name: "NVIDIA Corporation", kind: "stock", words: ["nvidia", "blackwell", "cuda", "spectrum"] },
  { ticker: "AMD", name: "Advanced Micro Devices", kind: "stock", words: ["amd", "mi400", "rocm"] },
  { ticker: "MSFT", name: "Microsoft Corporation", kind: "stock", words: ["microsoft", "azure"] },
  { ticker: "GOOGL", name: "Alphabet Inc.", kind: "stock", words: ["google", "gemini", "tpu", "alphabet"] },
  { ticker: "AMZN", name: "Amazon.com, Inc.", kind: "stock", words: ["aws", "trainium", "amazon"] },
];

function detectSentiment(text: string): "bullish" | "bearish" | "neutral" {
  const lower = text.toLowerCase();
  const bullish = ["exceeds", "demand", "accelerating", "growth", "record", "strong", "outstrip"];
  const bearish = ["constraint", "bottleneck", "shortage", "decline", "weak", "headwind"];
  const hasBull = bullish.some((w) => lower.includes(w));
  const hasBear = bearish.some((w) => lower.includes(w));
  if (hasBull && !hasBear) return "bullish";
  if (hasBear && !hasBull) return "neutral";
  return hasBull ? "bullish" : "neutral";
}

/**
 * Deterministic, network-free LLM mock. Derives signals, mentions, and themes from
 * the statement text via keyword rules, so tests are stable and the app runs offline.
 */
export class MockLLMClient implements LLMClient {
  readonly id = "mock";

  async analyzeStatement(statement: Statement, person: Person): Promise<AnalyzeResponse> {
    const text = statement.rawText.toLowerCase();

    // Signals: reuse any fixture signals, else derive one per matched category.
    const signals =
      statement.extractedSignals.length > 0
        ? statement.extractedSignals
        : CATEGORY_KEYWORDS.filter((c) => c.words.some((w) => text.includes(w))).map((c) => ({
            text: `${person.company} signal: ${c.title}`,
            category: c.category,
          }));

    // Stock mentions: the person's own ticker plus any dictionary hits.
    const tickers = new Map<string, { ticker: string; name: string; kind: "stock" | "etf" }>();
    if (person.ticker) {
      tickers.set(person.ticker, { ticker: person.ticker, name: person.company, kind: "stock" });
    }
    for (const entry of TICKER_DICTIONARY) {
      if (entry.words.some((w) => text.includes(w))) {
        tickers.set(entry.ticker, { ticker: entry.ticker, name: entry.name, kind: entry.kind });
      }
    }
    const sentiment = detectSentiment(statement.rawText);
    const stockMentions = [...tickers.values()].map((t) => ({
      ...t,
      context: statement.keyQuotes[0] ?? statement.rawText.slice(0, 160),
      sentiment,
    }));

    // Themes: one per matched category, confidence scaled by keyword hits.
    const themes = CATEGORY_KEYWORDS.filter((c) => c.words.some((w) => text.includes(w))).map((c) => {
      const hits = c.words.filter((w) => text.includes(w)).length;
      return {
        title: c.title,
        summary: `Derived from ${person.name}'s statement: ${statement.keyQuotes[0] ?? statement.rawText.slice(0, 120)}`,
        category: c.category,
        confidence: Math.min(0.5 + hits * 0.15, 0.95),
      };
    });

    const result = AnalysisResultSchema.parse({ signals, stockMentions, themes });

    return {
      result,
      usage: {
        inputTokens: Math.ceil(statement.rawText.length / 4),
        outputTokens: 128,
        estimatedCostUsd: 0,
      },
    };
  }
}
