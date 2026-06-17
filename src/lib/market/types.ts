import { z } from "zod";

/** A single price point on a sparkline series. */
export const PricePointSchema = z.object({
  /** ISO date (YYYY-MM-DD). */
  date: z.string().min(1),
  close: z.number().nonnegative(),
});
export type PricePoint = z.infer<typeof PricePointSchema>;

/** A quote + recent price series for one ticker. */
export const QuoteSchema = z.object({
  ticker: z.string().min(1),
  price: z.number().nonnegative(),
  changePercent: z.number(),
  series: z.array(PricePointSchema),
});
export type Quote = z.infer<typeof QuoteSchema>;

/**
 * Market-data adapter. The fixture impl is deterministic and offline; a real
 * provider impl can be added later behind the same interface (Phase 8 / DEPLOY).
 */
export interface MarketDataProvider {
  readonly id: string;
  getQuote(ticker: string): Promise<Quote | null>;
  getQuotes(tickers: string[]): Promise<Record<string, Quote>>;
}
