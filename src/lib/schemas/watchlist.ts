import { z } from "zod";
import { IdSchema, IsoDateSchema, SentimentSchema } from "./common";

/** An alert rule attached to a watchlist (delivery is stubbed in MVP). */
export const AlertRuleSchema = z.object({
  type: z.enum(["new-statement", "new-theme", "sentiment-change"]),
  ticker: z.string().min(1).max(8).optional(),
  personId: IdSchema.optional(),
  sentiment: SentimentSchema.optional(),
});
export type AlertRule = z.infer<typeof AlertRuleSchema>;

/** A user's saved set of tickers/people to follow (future SaaS). */
export const UserWatchlistSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  name: z.string().min(1).default("My Watchlist"),
  tickers: z.array(z.string().min(1).max(8)).default([]),
  personIds: z.array(IdSchema).default([]),
  createdAt: IsoDateSchema.optional(),
});
export type UserWatchlist = z.infer<typeof UserWatchlistSchema>;

export const UserWatchlistInputSchema = UserWatchlistSchema.omit({ id: true, createdAt: true });
export type UserWatchlistInput = z.infer<typeof UserWatchlistInputSchema>;

/** An alert generated/queued for a user (delivery is a stubbed interface in MVP). */
export const AlertSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  watchlistId: IdSchema,
  rule: AlertRuleSchema,
  status: z.enum(["pending", "sent", "dismissed"]).default("pending"),
  message: z.string().min(1),
  createdAt: IsoDateSchema.optional(),
});
export type Alert = z.infer<typeof AlertSchema>;

export const AlertInputSchema = AlertSchema.omit({ id: true, createdAt: true });
export type AlertInput = z.infer<typeof AlertInputSchema>;
