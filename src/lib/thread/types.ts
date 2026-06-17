import { z } from "zod";

/** X/Twitter hard limit per tweet. */
export const TWEET_MAX = 280;

export const TweetSchema = z.object({
  text: z.string().min(1).max(TWEET_MAX),
});
export type Tweet = z.infer<typeof TweetSchema>;

/** A generated multi-tweet thread. Always includes a disclaimer line. */
export const ThreadSchema = z.object({
  sourceType: z.enum(["theme", "statement"]),
  sourceId: z.string().min(1),
  /** Suggested executive photo/handle to attach, if any. */
  suggestedPhotoUrl: z.string().url().optional(),
  suggestedHandle: z.string().optional(),
  tweets: z.array(TweetSchema).min(2),
  /** A short caption describing the suggested chart/sparkline. */
  chartCaption: z.string().optional(),
  /** True once the disclaimer tweet has been appended (enforced by the generator). */
  disclaimerIncluded: z.literal(true),
});
export type Thread = z.infer<typeof ThreadSchema>;
