import { describe, it, expect } from "vitest";

import { RssSource } from "./rss-source";

const SAMPLE_RSS = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>NVIDIA Newsroom</title>
    <item>
      <title><![CDATA[Jensen Huang on the AI factory era]]></title>
      <link>https://example.com/news/ai-factory</link>
      <pubDate>Mon, 12 May 2026 09:00:00 GMT</pubDate>
      <description><![CDATA[The buildout of AI factories is <b>accelerating</b> across every region.]]></description>
    </item>
    <item>
      <title>Networking becomes a platform</title>
      <link>https://example.com/news/networking</link>
      <pubDate>Tue, 13 May 2026 09:00:00 GMT</pubDate>
      <content:encoded><![CDATA[Spectrum-X and NVLink are now a multi-billion-dollar business.]]></content:encoded>
    </item>
  </channel>
</rss>`;

describe("RssSource", () => {
  it("parses RSS items into raw source items with cleaned text", () => {
    const source = new RssSource({ feedUrl: "https://example.com/feed", personId: "p_jensen_huang" });
    const items = source.parse(SAMPLE_RSS);

    expect(items).toHaveLength(2);
    expect(items[0]?.title).toBe("Jensen Huang on the AI factory era");
    expect(items[0]?.url).toBe("https://example.com/news/ai-factory");
    expect(items[0]?.text).toContain("buildout of AI factories");
    expect(items[0]?.text).not.toContain("<b>"); // HTML stripped
    expect(items[0]?.personId).toBe("p_jensen_huang");
    expect(items[0]?.source).toBe("article");

    // Prefers content:encoded over description.
    expect(items[1]?.text).toContain("Spectrum-X and NVLink");
  });

  it("uses the injected fetcher (no network) in fetchItems", async () => {
    const source = new RssSource({
      feedUrl: "https://example.com/feed",
      personId: "p_lisa_su",
      source: "press-release",
      fetcher: async () => SAMPLE_RSS,
    });
    const items = await source.fetchItems();
    expect(items).toHaveLength(2);
    expect(items.every((i) => i.personId === "p_lisa_su")).toBe(true);
    expect(items.every((i) => i.source === "press-release")).toBe(true);
  });

  it("returns no items for an empty feed", () => {
    const source = new RssSource({ feedUrl: "https://example.com/empty", personId: "p_jensen_huang" });
    expect(source.parse("<rss><channel></channel></rss>")).toHaveLength(0);
  });
});
