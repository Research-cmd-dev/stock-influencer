import { describe, it, expect } from "vitest";

import {
  PersonSchema,
  StatementSchema,
  ThemeSchema,
  StockMentionSchema,
} from "@/lib/schemas";
import { PEOPLE, STATEMENTS, THEMES, STOCK_MENTIONS } from "./fixtures";

describe("seed fixtures", () => {
  it("all fixtures satisfy their schemas", () => {
    PEOPLE.forEach((p) => expect(() => PersonSchema.parse(p)).not.toThrow());
    STATEMENTS.forEach((s) => expect(() => StatementSchema.parse(s)).not.toThrow());
    THEMES.forEach((t) => expect(() => ThemeSchema.parse(t)).not.toThrow());
    STOCK_MENTIONS.forEach((m) => expect(() => StockMentionSchema.parse(m)).not.toThrow());
  });

  it("has 5 executives with unique ids", () => {
    expect(PEOPLE).toHaveLength(5);
    expect(new Set(PEOPLE.map((p) => p.id)).size).toBe(5);
  });

  it("every statement references a known person", () => {
    const personIds = new Set(PEOPLE.map((p) => p.id));
    STATEMENTS.forEach((s) => expect(personIds.has(s.personId)).toBe(true));
  });

  it("every stock mention references a known statement", () => {
    const statementIds = new Set(STATEMENTS.map((s) => s.id));
    STOCK_MENTIONS.forEach((m) => expect(statementIds.has(m.sourceStatementId)).toBe(true));
  });

  it("theme relations point at known statements and mentions", () => {
    const statementIds = new Set(STATEMENTS.map((s) => s.id));
    const mentionIds = new Set(STOCK_MENTIONS.map((m) => m.id));
    THEMES.forEach((t) => {
      t.relatedStatementIds.forEach((id) => expect(statementIds.has(id)).toBe(true));
      t.relatedStockMentionIds.forEach((id) => expect(mentionIds.has(id)).toBe(true));
    });
  });
});
