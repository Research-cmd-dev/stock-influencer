"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { getDataStore } from "@/lib/db";
import { logger } from "@/lib/logger";
import { toErrorMessage } from "@/lib/errors";

const CreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  tickers: z.string().trim().default(""),
});

export interface WatchlistActionState {
  error?: string;
  ok?: boolean;
}

/** Create a watchlist for the current user. Gated: requires authentication. */
export async function createWatchlistAction(
  _prev: WatchlistActionState,
  formData: FormData,
): Promise<WatchlistActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be signed in." };

  const parsed = CreateSchema.safeParse({
    name: formData.get("name"),
    tickers: formData.get("tickers") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const tickers = parsed.data.tickers
    .split(/[\s,]+/)
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 20);

  try {
    await getDataStore().createWatchlist({
      userId: user.id,
      name: parsed.data.name,
      tickers,
      personIds: [],
    });
    revalidatePath("/watchlist");
    return { ok: true };
  } catch (err) {
    logger.error("Failed to create watchlist", { error: err });
    return { error: toErrorMessage(err) };
  }
}
