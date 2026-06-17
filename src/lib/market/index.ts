import { logger } from "@/lib/logger";
import type { MarketDataProvider } from "@/lib/market/types";
import { FixtureMarketProvider } from "@/lib/market/fixture-provider";

export type { MarketDataProvider, Quote, PricePoint } from "@/lib/market/types";
export { QuoteSchema, PricePointSchema } from "@/lib/market/types";
export { FixtureMarketProvider } from "@/lib/market/fixture-provider";

let singleton: MarketDataProvider | null = null;

/**
 * Resolve the active market-data provider. Only a deterministic fixture provider
 * exists today; a real provider can be slotted in behind the same interface when
 * keys/network are available (Phase 8 / DEPLOY.md).
 */
export function getMarketProvider(): MarketDataProvider {
  if (singleton) return singleton;
  logger.info("Using fixture market-data provider");
  singleton = new FixtureMarketProvider();
  return singleton;
}

export function __setMarketProviderForTests(provider: MarketDataProvider | null): void {
  singleton = provider;
}
