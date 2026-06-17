import { QuoteSchema, type Quote, type MarketDataProvider, type PricePoint } from "@/lib/market/types";

/** Deterministic pseudo-random in [0,1) from a string seed (no Math.random). */
function seededUnit(seed: string, i: number): number {
  let h = 2166136261 ^ i;
  for (let k = 0; k < seed.length; k++) {
    h = Math.imul(h ^ seed.charCodeAt(k), 16777619);
  }
  // Map to [0,1)
  return ((h >>> 0) % 100000) / 100000;
}

/** Base prices keep fixtures looking plausible without any network. */
const BASE_PRICES: Record<string, number> = {
  NVDA: 142,
  AMD: 168,
  MSFT: 438,
  GOOGL: 192,
  AMZN: 214,
  SMH: 268,
};

const SERIES_LENGTH = 30;

/**
 * Deterministic, offline market-data provider. Generates a stable 30-point price
 * series per ticker so sparklines render identically across runs and in tests.
 */
export class FixtureMarketProvider implements MarketDataProvider {
  readonly id = "fixture";

  async getQuote(ticker: string): Promise<Quote | null> {
    const t = ticker.toUpperCase();
    const base = BASE_PRICES[t];
    if (base === undefined) return null;

    const series: PricePoint[] = [];
    let price = base;
    const start = new Date("2026-05-01T00:00:00.000Z");
    for (let i = 0; i < SERIES_LENGTH; i++) {
      // Drift ±2.5% per step, deterministic by ticker+index.
      const delta = (seededUnit(t, i) - 0.48) * 0.05;
      price = Math.max(1, price * (1 + delta));
      const d = new Date(start.getTime() + i * 86_400_000);
      series.push({ date: d.toISOString().slice(0, 10), close: Number(price.toFixed(2)) });
    }

    const first = series[0]!.close;
    const last = series[series.length - 1]!.close;
    const changePercent = Number((((last - first) / first) * 100).toFixed(2));

    return QuoteSchema.parse({ ticker: t, price: last, changePercent, series });
  }

  async getQuotes(tickers: string[]): Promise<Record<string, Quote>> {
    const out: Record<string, Quote> = {};
    for (const ticker of tickers) {
      const quote = await this.getQuote(ticker);
      if (quote) out[quote.ticker] = quote;
    }
    return out;
  }
}
