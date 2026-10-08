import Link from "next/link";

export function TagChip({ tag, count }: { tag: string; count?: number }) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-sm text-[var(--fg-muted)] transition-colors hover:bg-brand/10 hover:text-brand"
    >
      <span>#{tag}</span>
      {count !== undefined && <span className="text-xs opacity-70">{count}</span>}
    </Link>
  );
}
