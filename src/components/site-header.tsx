import Link from "next/link";
import { Activity } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/themes", label: "Themes" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/style-guide", label: "Style Guide" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Activity className="size-5 text-primary" aria-hidden="true" />
          ExecSignal
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
