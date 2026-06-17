/**
 * Seed a hosted Supabase project with the demo fixtures (5 execs + statements +
 * themes + stock mentions), preserving their stable fixture ids so relations line up.
 *
 * Requires DATA_BACKEND=supabase plus Supabase env vars; otherwise it explains that
 * the app already runs against these same fixtures in-memory with no seeding needed.
 */
import { getEnv } from "../src/lib/env";
import { logger } from "../src/lib/logger";
import { createServiceClient } from "../src/lib/db/supabase-client";
import { PEOPLE, STATEMENTS, THEMES, STOCK_MENTIONS } from "../src/lib/db/fixtures";
import {
  personToRow,
  themeToRow,
  stockMentionToRow,
} from "../src/lib/db/mappers";

async function main(): Promise<void> {
  const env = getEnv();
  if (env.DATA_BACKEND !== "supabase") {
    logger.info(
      "DATA_BACKEND is not 'supabase' — the app already serves these fixtures in-memory. " +
        "Set DATA_BACKEND=supabase and provide keys to seed a real project.",
    );
    return;
  }

  const client = createServiceClient();

  // People (preserve fixture ids).
  const peopleRows = PEOPLE.map((p) => ({ id: p.id, ...personToRow(p) }));
  const peopleRes = await client.from("people").upsert(peopleRows);
  if (peopleRes.error) throw new Error(`seed people: ${peopleRes.error.message}`);

  // Statements (preserve ids, include derived fields).
  const statementRows = STATEMENTS.map((s) => ({
    id: s.id,
    person_id: s.personId,
    source: s.source,
    source_url: s.sourceUrl ?? null,
    title: s.title ?? null,
    date: s.date,
    raw_text: s.rawText,
    key_quotes: s.keyQuotes,
    extracted_signals: s.extractedSignals,
    dedupe_hash: s.dedupeHash ?? null,
  }));
  const stmtRes = await client.from("statements").upsert(statementRows);
  if (stmtRes.error) throw new Error(`seed statements: ${stmtRes.error.message}`);

  // Stock mentions (preserve ids).
  const mentionRows = STOCK_MENTIONS.map((m) => ({ id: m.id, ...stockMentionToRow(m) }));
  const mentionRes = await client.from("stock_mentions").upsert(mentionRows);
  if (mentionRes.error) throw new Error(`seed stock_mentions: ${mentionRes.error.message}`);

  // Themes (preserve ids).
  const themeRows = THEMES.map((t) => ({ id: t.id, ...themeToRow(t) }));
  const themeRes = await client.from("themes").upsert(themeRows);
  if (themeRes.error) throw new Error(`seed themes: ${themeRes.error.message}`);

  logger.info("Seed complete", {
    people: PEOPLE.length,
    statements: STATEMENTS.length,
    stockMentions: STOCK_MENTIONS.length,
    themes: THEMES.length,
  });
}

main().catch((err) => {
  logger.error("Seed failed", { error: err });
  process.exitCode = 1;
});
