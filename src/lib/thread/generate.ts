import { DISCLAIMER_SHORT } from "@/components/disclaimer";
import type { Person, Statement, StockMention, Theme } from "@/lib/schemas";
import { ThreadSchema, TWEET_MAX, type Thread } from "@/lib/thread/types";

/** Greedily pack a long body into tweet-sized chunks, optionally reserving room for a numbering suffix. */
function packIntoTweets(body: string, reserve = 0): string[] {
  const limit = TWEET_MAX - reserve;
  const words = body.split(/\s+/).filter(Boolean);
  const tweets: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > limit) {
      if (current) tweets.push(current);
      // A single word longer than the limit gets hard-sliced.
      current = word.length > limit ? word.slice(0, limit) : word;
    } else {
      current = candidate;
    }
  }
  if (current) tweets.push(current);
  return tweets.length > 0 ? tweets : [body.slice(0, limit)];
}

function tickerLine(mentions: StockMention[]): string | null {
  if (mentions.length === 0) return null;
  const symbols = [...new Set(mentions.map((m) => `$${m.ticker}`))].slice(0, 6);
  return `Stocks to watch: ${symbols.join(" ")}`;
}

export interface GenerateThreadOptions {
  theme: Theme;
  mentions?: StockMention[];
  /** Optional executive whose statement seeded the theme (for photo/handle). */
  person?: Person;
}

/**
 * Deterministically generate an X thread from a theme. Always ends with a short
 * disclaimer line (a hard product rule), and never frames anything as a personalized
 * buy/sell recommendation. Output is Zod-validated before return.
 */
export function generateThreadFromTheme(options: GenerateThreadOptions): Thread {
  const { theme, mentions = [], person } = options;
  const bodies: string[] = [];

  // 1. Hook.
  bodies.push(`🧵 ${theme.title}`);

  // 2. Thesis (may span multiple tweets).
  bodies.push(...packIntoTweets(theme.summary));

  // 3. Stocks to watch.
  const tickers = tickerLine(mentions);
  if (tickers) bodies.push(tickers);

  // 4. Confidence / signal strength.
  bodies.push(`Signal confidence: ${Math.round(theme.confidence * 100)}% (ExecSignal).`);

  // 5. Disclaimer (required).
  bodies.push(DISCLAIMER_SHORT);

  // Number the tweets "(i/n)".
  const total = bodies.length;
  const tweets = bodies.map((text, i) => {
    const suffix = ` (${i + 1}/${total})`;
    const trimmed = text.length + suffix.length > TWEET_MAX ? text.slice(0, TWEET_MAX - suffix.length) : text;
    return { text: `${trimmed}${suffix}` };
  });

  const chartCaption = tickers
    ? `30-day price action for ${mentions[0]?.ticker ?? "the basket"}.`
    : undefined;

  return ThreadSchema.parse({
    sourceType: "theme",
    sourceId: theme.id,
    suggestedPhotoUrl: person?.photoUrl,
    suggestedHandle: person?.xHandle,
    tweets,
    chartCaption,
    disclaimerIncluded: true,
  });
}

/** Generate a thread from a single statement (thesis + its mentions). */
export function generateThreadFromStatement(options: {
  statement: Statement;
  person: Person;
  mentions?: StockMention[];
}): Thread {
  const { statement, person, mentions = [] } = options;
  const bodies: string[] = [];

  bodies.push(`🧵 ${person.name} (${person.company}) — ${statement.title ?? "latest"}`);
  const lead = statement.keyQuotes[0] ?? statement.rawText;
  bodies.push(...packIntoTweets(lead));

  const tickers = tickerLine(mentions);
  if (tickers) bodies.push(tickers);

  bodies.push(DISCLAIMER_SHORT);

  const total = bodies.length;
  const tweets = bodies.map((text, i) => {
    const suffix = ` (${i + 1}/${total})`;
    const trimmed = text.length + suffix.length > TWEET_MAX ? text.slice(0, TWEET_MAX - suffix.length) : text;
    return { text: `${trimmed}${suffix}` };
  });

  return ThreadSchema.parse({
    sourceType: "statement",
    sourceId: statement.id,
    suggestedPhotoUrl: person.photoUrl,
    suggestedHandle: person.xHandle,
    tweets,
    chartCaption: tickers ? `30-day price action for ${mentions[0]?.ticker}.` : undefined,
    disclaimerIncluded: true,
  });
}
