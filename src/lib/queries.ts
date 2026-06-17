import "server-only";

import { getDataStore } from "@/lib/db";
import { getMarketProvider } from "@/lib/market";
import type { Person, Statement, Theme, StockMention } from "@/lib/schemas";
import type { Quote } from "@/lib/market";

/** An executive paired with their most recent statement. */
export interface ExecWithLatest {
  person: Person;
  latestStatement?: Statement;
}

export async function getExecsWithLatest(): Promise<ExecWithLatest[]> {
  const store = getDataStore();
  const people = await store.listPeople();
  return Promise.all(
    people.map(async (person) => {
      const [latestStatement] = await store.listStatements({ personId: person.id, limit: 1 });
      return { person, latestStatement };
    }),
  );
}

/** Stock mentions enriched with a deterministic quote/sparkline. */
export interface MentionWithQuote {
  mention: StockMention;
  quote?: Quote;
}

export async function getMentionsWithQuotes(
  mentions: StockMention[],
): Promise<MentionWithQuote[]> {
  const market = getMarketProvider();
  const quotes = await market.getQuotes(mentions.map((m) => m.ticker));
  return mentions.map((mention) => ({ mention, quote: quotes[mention.ticker] }));
}

/** Distinct stock mentions across the store, most-recent tickers first. */
export async function getTopMentions(limit = 8): Promise<StockMention[]> {
  const store = getDataStore();
  const all = await store.listStockMentions();
  const seen = new Set<string>();
  const distinct: StockMention[] = [];
  for (const m of all) {
    if (seen.has(m.ticker)) continue;
    seen.add(m.ticker);
    distinct.push(m);
    if (distinct.length >= limit) break;
  }
  return distinct;
}

/** A theme with its related stock mentions resolved. */
export interface ThemeWithMentions {
  theme: Theme;
  mentions: StockMention[];
}

export async function getThemeWithMentions(themeId: string): Promise<ThemeWithMentions | null> {
  const store = getDataStore();
  const theme = await store.getTheme(themeId);
  if (!theme) return null;
  const mentions = (
    await Promise.all(theme.relatedStockMentionIds.map((id) => store.getStockMention(id)))
  ).filter((m): m is StockMention => m !== null);
  return { theme, mentions };
}
