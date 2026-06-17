"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import type { Person } from "@/lib/schemas";
import { createStatementAction, type CreateStatementState } from "./actions";

const SOURCE_OPTIONS = [
  "transcript",
  "interview",
  "keynote",
  "tweet",
  "article",
  "press-release",
  "manual",
] as const;

const initialState: CreateStatementState = { status: "idle" };

const fieldClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function StatementForm({ people }: { people: Person[] }) {
  const [state, formAction, pending] = useActionState(createStatementAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Executive</span>
          <select name="personId" required className={fieldClass} defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.company}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Source type</span>
          <select name="source" required className={fieldClass} defaultValue="interview">
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Date</span>
          <input name="date" type="date" required className={fieldClass} />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Source URL (optional)</span>
          <input name="sourceUrl" type="url" placeholder="https://…" className={fieldClass} />
        </label>
      </div>

      <label className="space-y-1.5 text-sm">
        <span className="font-medium">Title (optional)</span>
        <input name="title" type="text" className={fieldClass} />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="font-medium">Statement text</span>
        <textarea name="rawText" required rows={6} className={fieldClass} />
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Ingesting…" : "Ingest statement"}
        </Button>
        {state.status !== "idle" && state.message ? (
          <p
            data-testid="form-status"
            className={
              state.status === "success"
                ? "text-sm text-bullish"
                : state.status === "duplicate"
                  ? "text-sm text-muted-foreground"
                  : "text-sm text-bearish"
            }
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
