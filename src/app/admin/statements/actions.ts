"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDataStore } from "@/lib/db";
import { ingestItems } from "@/lib/sources";
import { logger } from "@/lib/logger";
import { toErrorMessage } from "@/lib/errors";
import { StatementSourceTypeSchema } from "@/lib/schemas";

export interface CreateStatementState {
  status: "idle" | "success" | "error" | "duplicate";
  message?: string;
}

const FormSchema = z.object({
  personId: z.string().min(1, "Select an executive"),
  source: StatementSourceTypeSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  title: z.string().trim().optional(),
  sourceUrl: z.string().trim().url("Must be a valid URL").or(z.literal("")).optional(),
  rawText: z.string().trim().min(1, "Statement text is required"),
});

/**
 * Server action: manual statement entry. Runs the same Zod-validated, dedupe-aware
 * ingestion pipeline as automated sources, so manual and automated paths converge.
 */
export async function createStatementAction(
  _prev: CreateStatementState,
  formData: FormData,
): Promise<CreateStatementState> {
  const parsed = FormSchema.safeParse({
    personId: formData.get("personId"),
    source: formData.get("source"),
    date: formData.get("date"),
    title: formData.get("title") ?? undefined,
    sourceUrl: formData.get("sourceUrl") ?? undefined,
    rawText: formData.get("rawText"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join("; ");
    logger.warn("Manual statement rejected", { message });
    return { status: "error", message };
  }

  const { personId, source, date, title, sourceUrl, rawText } = parsed.data;

  try {
    const store = getDataStore();
    const result = await ingestItems(store, [
      {
        personId,
        source,
        publishedAt: date,
        title: title || undefined,
        url: sourceUrl ? sourceUrl : undefined,
        text: rawText,
      },
    ]);

    if (result.ingested.length > 0) {
      revalidatePath("/");
      revalidatePath("/admin/statements");
      return { status: "success", message: "Statement ingested." };
    }
    if (result.duplicates > 0) {
      return { status: "duplicate", message: "That statement already exists (deduplicated)." };
    }
    const reason = result.rejected[0]?.reason ?? "Unknown validation error";
    return { status: "error", message: reason };
  } catch (err) {
    const message = toErrorMessage(err);
    logger.error("Manual statement ingest failed", { message });
    return { status: "error", message };
  }
}
