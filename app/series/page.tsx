import type { Metadata } from "next";
import Link from "next/link";
import { getAllSeries, getPostsBySeries } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "시리즈",
  description: "연재 글 묶음",
};

export default function SeriesIndexPage() {
  const series = getAllSeries();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="mb-8 text-2xl font-bold">시리즈</h1>

      {series.length === 0 ? (
        <p className="text-[var(--fg-muted)]">아직 시리즈가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {series.map(({ series: name, count }) => {
            const posts = getPostsBySeries(name);
            const latest = posts[posts.length - 1];
            return (
              <Link
                key={name}
                href={`/series/${encodeURIComponent(name)}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-bold group-hover:text-brand">{name}</h2>
                  <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                    {count}편
                  </span>
                </div>
                <p className="text-sm text-[var(--fg-muted)]">
                  최근 글: {latest.title}
                </p>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  {formatDate(latest.date)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
