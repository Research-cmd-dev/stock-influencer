import { ThemeCard } from "@/components/theme-card";
import { Disclaimer } from "@/components/disclaimer";
import { getDataStore } from "@/lib/db";

export const metadata = { title: "Themes · ExecSignal" };

export default async function ThemesPage() {
  const themes = await getDataStore().listThemes();

  return (
    <main className="container space-y-6 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Investment themes</h1>
        <p className="text-sm text-muted-foreground">
          Clustered from executive statements, ranked by confidence.
        </p>
        <Disclaimer />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} />
        ))}
      </div>
    </main>
  );
}
