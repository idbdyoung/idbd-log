import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {siteConfig.title}
        </Link>

        <nav className="flex items-center gap-1">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--fg)]"
            >
              {item.label}
            </Link>
          ))}
          <span className="mx-1 h-5 w-px bg-[var(--border)]" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
