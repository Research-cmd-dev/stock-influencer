import { logger } from "@/lib/logger";
import type { Thread } from "@/lib/thread/types";

export interface PostResult {
  posted: boolean;
  reason?: string;
}

/**
 * Posting adapter for X. Auto-posting is a NON-GOAL for the MVP, so the only
 * implementation is a disabled stub that refuses to post. A real adapter would
 * implement this same interface behind an explicit, human-enabled flag.
 */
export interface ThreadPoster {
  readonly id: string;
  readonly enabled: boolean;
  post(thread: Thread): Promise<PostResult>;
}

/** Disabled stub — never posts. MVP generates threads; humans post them manually. */
export class DisabledXPoster implements ThreadPoster {
  readonly id = "x-disabled";
  readonly enabled = false;

  async post(thread: Thread): Promise<PostResult> {
    logger.warn("Refusing to auto-post: X posting is disabled in MVP", {
      sourceId: thread.sourceId,
      tweets: thread.tweets.length,
    });
    return { posted: false, reason: "X auto-posting is disabled in MVP." };
  }
}

/** Build an X web-intent URL that pre-fills the first tweet for manual posting. */
export function webIntentUrl(thread: Thread): string {
  const first = thread.tweets[0]?.text ?? "";
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(first)}`;
}

/** Join all tweets into a single clipboard-friendly block. */
export function threadToPlainText(thread: Thread): string {
  return thread.tweets.map((t) => t.text).join("\n\n");
}
