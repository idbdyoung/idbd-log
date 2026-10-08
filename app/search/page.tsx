"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface PagefindResult {
  url: string;
  meta: { title?: string };
  excerpt: string;
}

interface Pagefind {
  search: (query: string) => Promise<{
    results: { data: () => Promise<PagefindResult> }[];
  }>;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "unavailable">(
    "idle"
  );
  const pagefindRef = useRef<Pagefind | null>(null);

  // Pagefind 번들은 빌드 후 public/pagefind/ 에 생성된다. 런타임에 동적 로드.
  async function ensurePagefind(): Promise<Pagefind | null> {
    if (pagefindRef.current) return pagefindRef.current;
    try {
      const mod = (await import(
        /* webpackIgnore: true */ /* turbopackIgnore: true */
        "/pagefind/pagefind.js" as string
      )) as unknown as Pagefind & { init?: () => Promise<void> };
      await mod.init?.();
      pagefindRef.current = mod;
      return mod;
    } catch {
      setStatus("unavailable");
      return null;
    }
  }

  useEffect(() => {
    const q = query.trim();
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (q.length === 0) {
        setResults([]);
        setStatus("idle");
        return;
      }
      setStatus("loading");
      const pf = await ensurePagefind();
      if (!pf || cancelled) return;
      const search = await pf.search(q);
      const data = await Promise.all(search.results.slice(0, 20).map((r) => r.data()));
      if (cancelled) return;
      // 서버 빌드 산출물(.next/server/app/*.html)을 인덱싱하므로 URL 끝의 .html 을 사이트 경로로 바꾼다.
      setResults(
        data.map((r) => ({
          ...r,
          url: r.url.replace(/\/index\.html$/, "/").replace(/\.html$/, "/"),
        }))
      );
      setStatus("ready");
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="mb-6 text-2xl font-bold">검색</h1>

      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-3 pl-12 pr-4 text-base outline-none transition-colors focus:border-brand"
        />
      </div>

      <div className="mt-8">
        {status === "unavailable" && (
          <p className="text-[var(--fg-muted)]">
            검색 인덱스는 프로덕션 빌드(<code>npm run build</code>) 후에 생성됩니다.
            개발 서버에서는 동작하지 않습니다.
          </p>
        )}
        {status === "loading" && <p className="text-[var(--fg-muted)]">검색 중…</p>}
        {status === "ready" && results.length === 0 && (
          <p className="text-[var(--fg-muted)]">검색 결과가 없습니다.</p>
        )}

        <ul className="space-y-4">
          {results.map((r) => (
            <li key={r.url}>
              <Link
                href={r.url}
                className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-colors hover:border-brand"
              >
                <h2 className="font-bold">{r.meta.title ?? r.url}</h2>
                <p
                  className="mt-1 text-sm text-[var(--fg-muted)] [&_mark]:bg-brand/20 [&_mark]:text-brand"
                  dangerouslySetInnerHTML={{ __html: r.excerpt }}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
