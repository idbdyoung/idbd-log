import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllSeries, getPostsBySeries } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

// 시리즈가 하나도 없을 때도 빈 배열을 피하기 위한 sentinel.
// output: export는 빈 generateStaticParams를 허용하지 않는다.
const EMPTY = "__none__";

export function generateStaticParams() {
  const series = getAllSeries();
  if (series.length === 0) return [{ name: EMPTY }];
  return series.map(({ series: name }) => ({ name: encodeURIComponent(name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  return { title: `시리즈: ${decoded}` };
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const posts = getPostsBySeries(decoded);

  if (posts.length === 0) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="mb-8 flex items-baseline gap-3">
        <h1 className="text-2xl font-bold">{decoded}</h1>
        <span className="text-sm text-[var(--fg-muted)]">{posts.length}편</span>
        <Link href="/series" className="ml-auto text-sm text-brand hover:underline">
          전체 시리즈
        </Link>
      </div>

      <ol className="space-y-4">
        {posts.map((post, i) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="group flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-colors hover:border-brand"
            >
              <span className="text-xl font-bold text-brand/40">{i + 1}</span>
              <div>
                <h2 className="font-bold group-hover:text-brand">{post.title}</h2>
                {post.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--fg-muted)]">
                    {post.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-[var(--fg-muted)]">
                  {formatDate(post.date)} · {post.readingTime}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
