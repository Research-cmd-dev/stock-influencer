import { logger } from "@/lib/logger";
import { toErrorMessage } from "@/lib/errors";
import type { DataStore } from "@/lib/db";
import type { Statement, Theme, StockMention } from "@/lib/schemas";
import type { LLMClient, LlmUsage } from "@/lib/llm/types";

export interface AnalyzeStatementOutcome {
  statementId: string;
  signalsCount: number;
  stockMentions: StockMention[];
  themes: Theme[];
  usage: LlmUsage;
}

/**
 * Analyze one statement and persist the results: extracted signals are written
 * back onto the statement, stock mentions and themes are created in the store.
 * Themes link to the statement and to the mentions created from it.
 */
export async function analyzeAndPersistStatement(
  store: DataStore,
  llm: LLMClient,
  statement: Statement,
): Promise<AnalyzeStatementOutcome> {
  const log = logger.child({ component: "analyze", statementId: statement.id, llm: llm.id });

  const person = await store.getPerson(statement.personId);
  if (!person) {
    throw new Error(`Cannot analyze statement ${statement.id}: person ${statement.personId} not found`);
  }

  const { result, usage } = await llm.analyzeStatement(statement, person);

  // 1. Persist signals onto the statement.
  await store.setStatementSignals(statement.id, result.signals);

  // 2. Persist stock mentions.
  const stockMentions: StockMention[] = [];
  for (const draft of result.stockMentions) {
    const created = await store.createStockMention({ ...draft, sourceStatementId: statement.id });
    stockMentions.push(created);
  }

  // 3. Persist themes, linked to this statement and the mentions just created.
  const mentionIds = stockMentions.map((m) => m.id);
  const themes: Theme[] = [];
  for (const draft of result.themes) {
    const created = await store.createTheme({
      ...draft,
      relatedStatementIds: [statement.id],
      relatedStockMentionIds: mentionIds,
      updatedAt: new Date().toISOString(),
    });
    themes.push(created);
  }

  log.info("Persisted analysis", {
    signals: result.signals.length,
    stockMentions: stockMentions.length,
    themes: themes.length,
    estimatedCostUsd: usage.estimatedCostUsd,
  });

  return {
    statementId: statement.id,
    signalsCount: result.signals.length,
    stockMentions,
    themes,
    usage,
  };
}

export interface BatchAnalysisSummary {
  analyzed: number;
  failed: number;
  totalStockMentions: number;
  totalThemes: number;
  totalCostUsd: number;
}

/** Analyze a batch of statements, accumulating usage and tolerating per-item failures. */
export async function analyzeStatements(
  store: DataStore,
  llm: LLMClient,
  statements: Statement[],
): Promise<BatchAnalysisSummary> {
  const summary: BatchAnalysisSummary = {
    analyzed: 0,
    failed: 0,
    totalStockMentions: 0,
    totalThemes: 0,
    totalCostUsd: 0,
  };

  for (const statement of statements) {
    try {
      const outcome = await analyzeAndPersistStatement(store, llm, statement);
      summary.analyzed += 1;
      summary.totalStockMentions += outcome.stockMentions.length;
      summary.totalThemes += outcome.themes.length;
      summary.totalCostUsd += outcome.usage.estimatedCostUsd ?? 0;
    } catch (err) {
      summary.failed += 1;
      logger.error("Statement analysis failed", {
        statementId: statement.id,
        reason: toErrorMessage(err),
      });
    }
  }

  logger.info("Batch analysis complete", { ...summary });
  return summary;
}
