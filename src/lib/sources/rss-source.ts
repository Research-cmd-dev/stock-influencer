import { logger } from "@/lib/logger";
import { ExternalServiceError } from "@/lib/errors";
import type { StatementSourceType } from "@/lib/schemas";
import { type RawSourceItem, type SourceAdapter } from "@/lib/sources/types";

export type Fetcher = (url: string) => Promise<string>;

const defaultFetcher: Fetcher = async (url) => {
  const res = await fetch(url, { headers: { Accept: "application/rss+xml, application/xml, text/xml" } });
  if (!res.ok) {
    throw new ExternalServiceError(`RSS fetch failed (${res.status})`, { context: { url } });
  }
  return res.text();
};

export interface RssSourceConfig {
  /** Feed URL. */
  feedUrl: string;
  /** Person these feed items are attributed to. */
  personId: string;
  /** Statement source type to record (defaults to "article"). */
  source?: StatementSourceType;
  /** Override the HTTP fetcher (injected in tests). */
  fetcher?: Fetcher;
}

/** Strip CDATA wrappers and basic HTML tags, decode a few common entities. */
function cleanText(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match?.[1] ? cleanText(match[1]) : undefined;
}

/**
 * Minimal RSS 2.0 adapter. Parses `<item>` blocks (title, link, pubDate,
 * description/content) without an XML dependency, then maps each to a RawSourceItem.
 * Items missing a usable body are skipped with a logged warning rather than thrown.
 */
export class RssSource implements SourceAdapter {
  readonly id: string;
  private readonly fetcher: Fetcher;

  constructor(private readonly config: RssSourceConfig) {
    this.id = `rss:${config.feedUrl}`;
    this.fetcher = config.fetcher ?? defaultFetcher;
  }

  async fetchItems(): Promise<RawSourceItem[]> {
    const xml = await this.fetcher(this.config.feedUrl);
    return this.parse(xml);
  }

  /** Exposed for tests: parse RSS XML text into raw items. */
  parse(xml: string): RawSourceItem[] {
    const source = this.config.source ?? "article";
    const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
    const items: RawSourceItem[] = [];

    for (const block of itemBlocks) {
      const title = extractTag(block, "title");
      const url = extractTag(block, "link");
      const publishedAt = extractTag(block, "pubDate") ?? new Date().toISOString();
      const body =
        extractTag(block, "content:encoded") ??
        extractTag(block, "description") ??
        title;

      if (!body) {
        logger.warn("Skipping RSS item with no usable body", { feed: this.config.feedUrl, url });
        continue;
      }

      items.push({
        externalId: url ?? title,
        personId: this.config.personId,
        source,
        title,
        url: url && /^https?:\/\//.test(url) ? url : undefined,
        publishedAt,
        text: body,
      });
    }

    logger.info("Parsed RSS feed", { feed: this.config.feedUrl, items: items.length });
    return items;
  }
}
