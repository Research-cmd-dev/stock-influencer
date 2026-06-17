import { randomUUID } from "node:crypto";
import type { z } from "zod";

import {
  PersonInputSchema,
  StatementInputSchema,
  ThemeInputSchema,
  StockMentionInputSchema,
  UserWatchlistInputSchema,
  AlertInputSchema,
  type Person,
  type PersonInput,
  type Statement,
  type StatementInput,
  type Theme,
  type ThemeInput,
  type StockMention,
  type StockMentionInput,
  type UserWatchlist,
  type UserWatchlistInput,
  type Alert,
  type AlertInput,
} from "@/lib/schemas";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { statementDedupeHash } from "@/lib/hash";
import { PEOPLE, STATEMENTS, THEMES, STOCK_MENTIONS } from "@/lib/db/fixtures";
import type { DataStore } from "@/lib/db/types";

/**
 * In-memory implementation of the DataStore. Backs tests, local dev, and any
 * offline/no-credentials run. Seeded from fixtures by default; pass `{ seed: false }`
 * for an empty store (used by ingestion/dedupe tests).
 */
export class MemoryStore implements DataStore {
  private people = new Map<string, Person>();
  private statements = new Map<string, Statement>();
  private themes = new Map<string, Theme>();
  private stockMentions = new Map<string, StockMention>();
  private watchlists = new Map<string, UserWatchlist>();
  private alerts = new Map<string, Alert>();

  constructor(options: { seed?: boolean } = {}) {
    if (options.seed ?? true) this.seed();
  }

  private seed(): void {
    for (const p of PEOPLE) this.people.set(p.id, p);
    for (const s of STATEMENTS) this.statements.set(s.id, s);
    for (const t of THEMES) this.themes.set(t.id, t);
    for (const m of STOCK_MENTIONS) this.stockMentions.set(m.id, m);
  }

  private parse<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, value: unknown, what: string): T {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new ValidationError(`Invalid ${what}`, { context: { issues: result.error.message } });
    }
    return result.data;
  }

  // People ---------------------------------------------------------------------
  async listPeople(): Promise<Person[]> {
    return [...this.people.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  async getPerson(id: string): Promise<Person | null> {
    return this.people.get(id) ?? null;
  }

  async createPerson(input: PersonInput): Promise<Person> {
    const parsed = this.parse<PersonInput>(PersonInputSchema, input, "person");
    const person: Person = { ...parsed, id: `p_${randomUUID()}` };
    this.people.set(person.id, person);
    return person;
  }

  // Statements -----------------------------------------------------------------
  async listStatements(options: { personId?: string; limit?: number } = {}): Promise<Statement[]> {
    let rows = [...this.statements.values()];
    if (options.personId) rows = rows.filter((s) => s.personId === options.personId);
    rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return typeof options.limit === "number" ? rows.slice(0, options.limit) : rows;
  }

  async getStatement(id: string): Promise<Statement | null> {
    return this.statements.get(id) ?? null;
  }

  async createStatement(input: StatementInput): Promise<Statement> {
    const parsed = this.parse<StatementInput>(StatementInputSchema, input, "statement");
    const dedupeHash = statementDedupeHash({
      personId: parsed.personId,
      source: parsed.source,
      rawText: parsed.rawText,
    });
    const statement: Statement = {
      ...parsed,
      id: `s_${randomUUID()}`,
      extractedSignals: [],
      dedupeHash,
      createdAt: new Date().toISOString(),
    };
    this.statements.set(statement.id, statement);
    return statement;
  }

  async findStatementByDedupeHash(hash: string): Promise<Statement | null> {
    for (const s of this.statements.values()) {
      if (s.dedupeHash === hash) return s;
    }
    return null;
  }

  async setStatementSignals(
    id: string,
    signals: Statement["extractedSignals"],
  ): Promise<Statement> {
    const existing = this.statements.get(id);
    if (!existing) throw new NotFoundError(`Statement ${id} not found`);
    const updated: Statement = { ...existing, extractedSignals: signals };
    this.statements.set(id, updated);
    return updated;
  }

  // Themes ---------------------------------------------------------------------
  async listThemes(options: { limit?: number } = {}): Promise<Theme[]> {
    const rows = [...this.themes.values()].sort((a, b) => b.confidence - a.confidence);
    return typeof options.limit === "number" ? rows.slice(0, options.limit) : rows;
  }

  async getTheme(id: string): Promise<Theme | null> {
    return this.themes.get(id) ?? null;
  }

  async createTheme(input: ThemeInput): Promise<Theme> {
    const parsed = this.parse<ThemeInput>(ThemeInputSchema, input, "theme");
    const theme: Theme = { ...parsed, id: `t_${randomUUID()}` };
    this.themes.set(theme.id, theme);
    return theme;
  }

  // Stock mentions -------------------------------------------------------------
  async listStockMentions(
    options: { ticker?: string; statementId?: string } = {},
  ): Promise<StockMention[]> {
    let rows = [...this.stockMentions.values()];
    if (options.ticker) {
      const t = options.ticker.toUpperCase();
      rows = rows.filter((m) => m.ticker === t);
    }
    if (options.statementId) rows = rows.filter((m) => m.sourceStatementId === options.statementId);
    return rows;
  }

  async getStockMention(id: string): Promise<StockMention | null> {
    return this.stockMentions.get(id) ?? null;
  }

  async createStockMention(input: StockMentionInput): Promise<StockMention> {
    const parsed = this.parse<StockMentionInput>(StockMentionInputSchema, input, "stock mention");
    const mention: StockMention = { ...parsed, id: `m_${randomUUID()}` };
    this.stockMentions.set(mention.id, mention);
    return mention;
  }

  // Watchlists & alerts --------------------------------------------------------
  async listWatchlists(userId: string): Promise<UserWatchlist[]> {
    return [...this.watchlists.values()].filter((w) => w.userId === userId);
  }

  async createWatchlist(input: UserWatchlistInput): Promise<UserWatchlist> {
    const parsed = this.parse<UserWatchlistInput>(UserWatchlistInputSchema, input, "watchlist");
    const watchlist: UserWatchlist = {
      ...parsed,
      id: `w_${randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    this.watchlists.set(watchlist.id, watchlist);
    return watchlist;
  }

  async listAlerts(userId: string): Promise<Alert[]> {
    return [...this.alerts.values()].filter((a) => a.userId === userId);
  }

  async createAlert(input: AlertInput): Promise<Alert> {
    const parsed = this.parse<AlertInput>(AlertInputSchema, input, "alert");
    const alert: Alert = {
      ...parsed,
      id: `a_${randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    this.alerts.set(alert.id, alert);
    return alert;
  }
}
