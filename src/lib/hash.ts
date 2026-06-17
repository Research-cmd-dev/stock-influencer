import { createHash } from "node:crypto";

/** Normalize text for stable hashing: lowercase, collapse whitespace, trim. */
export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Deterministic dedupe hash for a statement. Combines the person, source, and
 * normalized text so the same statement ingested twice collapses to one row.
 */
export function statementDedupeHash(parts: {
  personId: string;
  source: string;
  rawText: string;
}): string {
  const basis = `${parts.personId}::${parts.source}::${normalizeText(parts.rawText)}`;
  return createHash("sha256").update(basis).digest("hex").slice(0, 32);
}
