import type { SupabaseClient } from "@supabase/supabase-js";

import {
  PersonSchema,
  StatementSchema,
  ThemeSchema,
  StockMentionSchema,
  UserWatchlistSchema,
  AlertSchema,
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
import { ExternalServiceError, ValidationError } from "@/lib/errors";
import { statementDedupeHash } from "@/lib/hash";
import type { DataStore } from "@/lib/db/types";
import {
  personFromRow,
  personToRow,
  statementFromRow,
  statementInsertRow,
  themeFromRow,
  themeToRow,
  stockMentionFromRow,
  stockMentionToRow,
  watchlistFromRow,
  watchlistToRow,
  alertFromRow,
  alertToRow,
} from "@/lib/db/mappers";

/**
 * Supabase-backed DataStore. Exercised only when DATA_BACKEND=supabase and a real
 * project is configured (deferred to Phase 8 / DEPLOY.md). Every read is re-validated
 * with Zod so the boundary stays trustworthy even if the schema drifts.
 */
export class SupabaseStore implements DataStore {
  constructor(private readonly client: SupabaseClient) {}

  private fail(op: string, error: { message: string } | null): never {
    throw new ExternalServiceError(`Supabase ${op} failed`, {
      context: { message: error?.message },
    });
  }

  async listPeople(): Promise<Person[]> {
    const { data, error } = await this.client.from("people").select("*").order("name");
    if (error) this.fail("listPeople", error);
    return (data ?? []).map((row) => PersonSchema.parse(personFromRow(row)));
  }

  async getPerson(id: string): Promise<Person | null> {
    const { data, error } = await this.client.from("people").select("*").eq("id", id).maybeSingle();
    if (error) this.fail("getPerson", error);
    return data ? PersonSchema.parse(personFromRow(data)) : null;
  }

  async createPerson(input: PersonInput): Promise<Person> {
    const parsed = PersonInputSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Invalid person", { cause: parsed.error });
    const { data, error } = await this.client
      .from("people")
      .insert(personToRow(parsed.data))
      .select("*")
      .single();
    if (error) this.fail("createPerson", error);
    return PersonSchema.parse(personFromRow(data));
  }

  async listStatements(options: { personId?: string; limit?: number } = {}): Promise<Statement[]> {
    let query = this.client.from("statements").select("*").order("date", { ascending: false });
    if (options.personId) query = query.eq("person_id", options.personId);
    if (typeof options.limit === "number") query = query.limit(options.limit);
    const { data, error } = await query;
    if (error) this.fail("listStatements", error);
    return (data ?? []).map((row) => StatementSchema.parse(statementFromRow(row)));
  }

  async getStatement(id: string): Promise<Statement | null> {
    const { data, error } = await this.client
      .from("statements")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) this.fail("getStatement", error);
    return data ? StatementSchema.parse(statementFromRow(data)) : null;
  }

  async createStatement(input: StatementInput): Promise<Statement> {
    const parsed = StatementInputSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Invalid statement", { cause: parsed.error });
    const dedupeHash = statementDedupeHash({
      personId: parsed.data.personId,
      source: parsed.data.source,
      rawText: parsed.data.rawText,
    });
    const { data, error } = await this.client
      .from("statements")
      .insert(statementInsertRow(parsed.data, dedupeHash))
      .select("*")
      .single();
    if (error) this.fail("createStatement", error);
    return StatementSchema.parse(statementFromRow(data));
  }

  async findStatementByDedupeHash(hash: string): Promise<Statement | null> {
    const { data, error } = await this.client
      .from("statements")
      .select("*")
      .eq("dedupe_hash", hash)
      .maybeSingle();
    if (error) this.fail("findStatementByDedupeHash", error);
    return data ? StatementSchema.parse(statementFromRow(data)) : null;
  }

  async listThemes(options: { limit?: number } = {}): Promise<Theme[]> {
    let query = this.client.from("themes").select("*").order("confidence", { ascending: false });
    if (typeof options.limit === "number") query = query.limit(options.limit);
    const { data, error } = await query;
    if (error) this.fail("listThemes", error);
    return (data ?? []).map((row) => ThemeSchema.parse(themeFromRow(row)));
  }

  async getTheme(id: string): Promise<Theme | null> {
    const { data, error } = await this.client.from("themes").select("*").eq("id", id).maybeSingle();
    if (error) this.fail("getTheme", error);
    return data ? ThemeSchema.parse(themeFromRow(data)) : null;
  }

  async createTheme(input: ThemeInput): Promise<Theme> {
    const parsed = ThemeInputSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Invalid theme", { cause: parsed.error });
    const { data, error } = await this.client
      .from("themes")
      .insert(themeToRow(parsed.data))
      .select("*")
      .single();
    if (error) this.fail("createTheme", error);
    return ThemeSchema.parse(themeFromRow(data));
  }

  async listStockMentions(
    options: { ticker?: string; statementId?: string } = {},
  ): Promise<StockMention[]> {
    let query = this.client.from("stock_mentions").select("*");
    if (options.ticker) query = query.eq("ticker", options.ticker.toUpperCase());
    if (options.statementId) query = query.eq("source_statement_id", options.statementId);
    const { data, error } = await query;
    if (error) this.fail("listStockMentions", error);
    return (data ?? []).map((row) => StockMentionSchema.parse(stockMentionFromRow(row)));
  }

  async getStockMention(id: string): Promise<StockMention | null> {
    const { data, error } = await this.client
      .from("stock_mentions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) this.fail("getStockMention", error);
    return data ? StockMentionSchema.parse(stockMentionFromRow(data)) : null;
  }

  async createStockMention(input: StockMentionInput): Promise<StockMention> {
    const parsed = StockMentionInputSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Invalid stock mention", { cause: parsed.error });
    const { data, error } = await this.client
      .from("stock_mentions")
      .insert(stockMentionToRow(parsed.data))
      .select("*")
      .single();
    if (error) this.fail("createStockMention", error);
    return StockMentionSchema.parse(stockMentionFromRow(data));
  }

  async listWatchlists(userId: string): Promise<UserWatchlist[]> {
    const { data, error } = await this.client
      .from("user_watchlists")
      .select("*")
      .eq("user_id", userId);
    if (error) this.fail("listWatchlists", error);
    return (data ?? []).map((row) => UserWatchlistSchema.parse(watchlistFromRow(row)));
  }

  async createWatchlist(input: UserWatchlistInput): Promise<UserWatchlist> {
    const parsed = UserWatchlistInputSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Invalid watchlist", { cause: parsed.error });
    const { data, error } = await this.client
      .from("user_watchlists")
      .insert(watchlistToRow(parsed.data))
      .select("*")
      .single();
    if (error) this.fail("createWatchlist", error);
    return UserWatchlistSchema.parse(watchlistFromRow(data));
  }

  async listAlerts(userId: string): Promise<Alert[]> {
    const { data, error } = await this.client.from("alerts").select("*").eq("user_id", userId);
    if (error) this.fail("listAlerts", error);
    return (data ?? []).map((row) => AlertSchema.parse(alertFromRow(row)));
  }

  async createAlert(input: AlertInput): Promise<Alert> {
    const parsed = AlertInputSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Invalid alert", { cause: parsed.error });
    const { data, error } = await this.client
      .from("alerts")
      .insert(alertToRow(parsed.data))
      .select("*")
      .single();
    if (error) this.fail("createAlert", error);
    return AlertSchema.parse(alertFromRow(data));
  }
}
