import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-5 text-sm text-[var(--fg-muted)]">
        <p>
          © {new Date().getFullYear()} {siteConfig.author}
        </p>
        <a href="/rss.xml" className="hover:text-[var(--fg)]">
          RSS
        </a>
      </div>
    </footer>
  );
}
