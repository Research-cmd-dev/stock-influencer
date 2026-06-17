import type {
  Person,
  PersonInput,
  StatementInput,
  ThemeInput,
  StockMentionInput,
  UserWatchlistInput,
  AlertInput,
} from "@/lib/schemas";

/**
 * Translate between snake_case Supabase rows and camelCase domain objects.
 * `*FromRow` outputs are passed straight to the corresponding Zod schema's
 * `.parse`, so they intentionally return loosely-typed records (validated downstream).
 */

type Row = Record<string, unknown>;

const dropUndefined = (obj: Row): Row =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

// People -----------------------------------------------------------------------
export function personFromRow(row: Row): Row {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    company: row.company,
    ticker: row.ticker ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    xHandle: row.x_handle ?? undefined,
    bio: row.bio ?? undefined,
  };
}

export function personToRow(p: PersonInput | Person): Row {
  return dropUndefined({
    ...("id" in p ? { id: p.id } : {}),
    name: p.name,
    role: p.role,
    company: p.company,
    ticker: p.ticker,
    photo_url: p.photoUrl,
    x_handle: p.xHandle,
    bio: p.bio,
  });
}

// Statements -------------------------------------------------------------------
export function statementFromRow(row: Row): Row {
  return {
    id: row.id,
    personId: row.person_id,
    source: row.source,
    sourceUrl: row.source_url ?? undefined,
    title: row.title ?? undefined,
    date: row.date,
    rawText: row.raw_text,
    keyQuotes: row.key_quotes ?? [],
    extractedSignals: row.extracted_signals ?? [],
    dedupeHash: row.dedupe_hash ?? undefined,
    createdAt: row.created_at ?? undefined,
  };
}

export function statementInsertRow(s: StatementInput, dedupeHash: string): Row {
  return dropUndefined({
    person_id: s.personId,
    source: s.source,
    source_url: s.sourceUrl,
    title: s.title,
    date: s.date,
    raw_text: s.rawText,
    key_quotes: s.keyQuotes,
    extracted_signals: [],
    dedupe_hash: dedupeHash,
  });
}

// Themes -----------------------------------------------------------------------
export function themeFromRow(row: Row): Row {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    category: row.category,
    confidence: row.confidence,
    relatedStatementIds: row.related_statement_ids ?? [],
    relatedStockMentionIds: row.related_stock_mention_ids ?? [],
    updatedAt: row.updated_at ?? undefined,
  };
}

export function themeToRow(t: ThemeInput): Row {
  return dropUndefined({
    title: t.title,
    summary: t.summary,
    category: t.category,
    confidence: t.confidence,
    related_statement_ids: t.relatedStatementIds,
    related_stock_mention_ids: t.relatedStockMentionIds,
    updated_at: t.updatedAt,
  });
}

// Stock mentions ---------------------------------------------------------------
export function stockMentionFromRow(row: Row): Row {
  return {
    id: row.id,
    ticker: row.ticker,
    name: row.name,
    kind: row.kind,
    context: row.context,
    sentiment: row.sentiment,
    sourceStatementId: row.source_statement_id,
  };
}

export function stockMentionToRow(m: StockMentionInput): Row {
  return {
    ticker: m.ticker,
    name: m.name,
    kind: m.kind,
    context: m.context,
    sentiment: m.sentiment,
    source_statement_id: m.sourceStatementId,
  };
}

// Watchlists & alerts ----------------------------------------------------------
export function watchlistFromRow(row: Row): Row {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    tickers: row.tickers ?? [],
    personIds: row.person_ids ?? [],
    createdAt: row.created_at ?? undefined,
  };
}

export function watchlistToRow(w: UserWatchlistInput): Row {
  return dropUndefined({
    user_id: w.userId,
    name: w.name,
    tickers: w.tickers,
    person_ids: w.personIds,
  });
}

export function alertFromRow(row: Row): Row {
  return {
    id: row.id,
    userId: row.user_id,
    watchlistId: row.watchlist_id,
    rule: row.rule,
    status: row.status,
    message: row.message,
    createdAt: row.created_at ?? undefined,
  };
}

export function alertToRow(a: AlertInput): Row {
  return dropUndefined({
    user_id: a.userId,
    watchlist_id: a.watchlistId,
    rule: a.rule,
    status: a.status,
    message: a.message,
  });
}
