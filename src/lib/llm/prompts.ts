import type { Person, Statement } from "@/lib/schemas";

/** JSON shape the model must emit. Kept in sync with AnalysisResultSchema. */
export const OUTPUT_CONTRACT = `Return ONLY a JSON object (no prose, no markdown fences) of the form:
{
  "signals": [{ "text": string, "category": string, "rationale"?: string }],
  "stockMentions": [{
    "ticker": string, "name": string, "kind": "stock" | "etf",
    "context": string, "sentiment": "bullish" | "bearish" | "neutral"
  }],
  "themes": [{
    "title": string, "summary": string,
    "category": "ai-compute" | "data-centers" | "chips-semis" | "infrastructure" | "software" | "energy-power" | "other",
    "confidence": number  // 0..1
  }]
}`;

export const SYSTEM_PROMPT = `You are ExecSignal's analysis engine. You read public statements from AI/tech executives and extract investable signal.

Your job, for a single statement:
1. Extract discrete, investable signals (concrete observations an investor could act on).
2. Identify specific stock/ETF mentions implied by the statement, each with a sentiment.
3. Propose investment themes the statement supports, each with a calibrated confidence in [0,1].

Be conservative: only surface tickers and themes the statement genuinely supports. Never invent quotes or facts. This is informational analysis, not financial advice.

${OUTPUT_CONTRACT}`;

/** Build the per-statement user prompt. */
export function buildUserPrompt(statement: Statement, person: Person): string {
  return [
    `Executive: ${person.name} — ${person.role}, ${person.company}${person.ticker ? ` (${person.ticker})` : ""}`,
    `Source: ${statement.source}${statement.title ? ` — ${statement.title}` : ""}`,
    `Date: ${statement.date}`,
    "",
    "Statement:",
    statement.rawText,
    "",
    "Analyze this statement and return the JSON object described above.",
  ].join("\n");
}
