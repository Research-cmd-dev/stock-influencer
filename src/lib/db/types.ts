import type {
  Person,
  PersonInput,
  Statement,
  StatementInput,
  Theme,
  ThemeInput,
  StockMention,
  StockMentionInput,
  UserWatchlist,
  UserWatchlistInput,
  Alert,
  AlertInput,
} from "@/lib/schemas";

/**
 * The data-access layer (DAL) contract. Every backend (in-memory fixture,
 * Supabase) implements this exact interface so the rest of the app is agnostic
 * to where data lives. All methods are async and may throw AppError subclasses.
 */
export interface DataStore {
  // People ---------------------------------------------------------------------
  listPeople(): Promise<Person[]>;
  getPerson(id: string): Promise<Person | null>;
  createPerson(input: PersonInput): Promise<Person>;

  // Statements -----------------------------------------------------------------
  listStatements(options?: { personId?: string; limit?: number }): Promise<Statement[]>;
  getStatement(id: string): Promise<Statement | null>;
  createStatement(input: StatementInput): Promise<Statement>;
  /** Returns an existing statement matching the dedupe hash, if any. */
  findStatementByDedupeHash(hash: string): Promise<Statement | null>;
  /** Replace the extracted signals on a statement (set by the analysis engine). */
  setStatementSignals(id: string, signals: Statement["extractedSignals"]): Promise<Statement>;

  // Themes ---------------------------------------------------------------------
  listThemes(options?: { limit?: number }): Promise<Theme[]>;
  getTheme(id: string): Promise<Theme | null>;
  createTheme(input: ThemeInput): Promise<Theme>;

  // Stock mentions -------------------------------------------------------------
  listStockMentions(options?: { ticker?: string; statementId?: string }): Promise<StockMention[]>;
  getStockMention(id: string): Promise<StockMention | null>;
  createStockMention(input: StockMentionInput): Promise<StockMention>;

  // Watchlists & alerts (future SaaS) ------------------------------------------
  listWatchlists(userId: string): Promise<UserWatchlist[]>;
  createWatchlist(input: UserWatchlistInput): Promise<UserWatchlist>;
  listAlerts(userId: string): Promise<Alert[]>;
  createAlert(input: AlertInput): Promise<Alert>;
}
