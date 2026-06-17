export type { RawSourceItem, SourceAdapter } from "@/lib/sources/types";
export { RawSourceItemSchema } from "@/lib/sources/types";
export { FixtureSource } from "@/lib/sources/fixture-source";
export { RssSource, type RssSourceConfig } from "@/lib/sources/rss-source";
export { ingestItems, ingestFromSource, type IngestResult } from "@/lib/sources/ingest";
