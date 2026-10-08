import Link from "next/link";

export function Pagination({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  if (total <= 1) return null;

  const href = (page: number) => (page === 1 ? "/" : `/page/${page}`);
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <nav className="mt-12 flex items-center justify-center gap-2">
      {current > 1 && (
        <Link
          href={href(current - 1)}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-subtle)]"
        >
          이전
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={href(page)}
          aria-current={page === current ? "page" : undefined}
          className={
            page === current
              ? "rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white"
              : "rounded-lg border border-[var(--border)] px-3.5 py-2 text-sm text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-subtle)]"
          }
        >
          {page}
        </Link>
      ))}

      {current < total && (
        <Link
          href={href(current + 1)}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-subtle)]"
        >
          다음
        </Link>
      )}
    </nav>
  );
}
