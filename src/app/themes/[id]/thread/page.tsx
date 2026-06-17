import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ThreadPreview } from "@/components/thread-preview";
import { Disclaimer } from "@/components/disclaimer";
import { getDataStore } from "@/lib/db";
import { getThemeWithMentions } from "@/lib/queries";
import { generateThreadFromTheme } from "@/lib/thread";

export default async function ThemeThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getThemeWithMentions(id);
  if (!data) notFound();

  const { theme, mentions } = data;
  // Use the first related statement's author for the suggested photo/handle, if any.
  const store = getDataStore();
  const firstStatementId = theme.relatedStatementIds[0];
  const firstStatement = firstStatementId ? await store.getStatement(firstStatementId) : null;
  const person = firstStatement ? await store.getPerson(firstStatement.personId) : null;

  const thread = generateThreadFromTheme({ theme, mentions, person: person ?? undefined });

  return (
    <main className="container max-w-2xl space-y-6 py-10">
      <Link
        href={`/themes/${theme.id}`}
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <ArrowLeft className="size-3" aria-hidden="true" />
        Back to theme
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Generated X thread</h1>
        <p className="text-sm text-muted-foreground">
          From the theme &ldquo;{theme.title}&rdquo;. Review, copy, and post manually — ExecSignal
          never auto-posts.
        </p>
        <Disclaimer />
      </header>

      <ThreadPreview thread={thread} />
    </main>
  );
}
