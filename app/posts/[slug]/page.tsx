import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllSlugs, getPostBySlug, getPostsBySeries } from "@/lib/posts";
import { siteConfig } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import { TagChip } from "@/components/TagChip";
import { Toc } from "@/components/Toc";
import { PostBody } from "@/components/PostBody";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: post.thumbnail ? [post.thumbnail] : undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const seriesPosts = post.series ? getPostsBySeries(post.series) : [];
  const seriesIndex = seriesPosts.findIndex((p) => p.slug === post.slug);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-10">
        <article className="min-w-0" data-pagefind-body>
          <header className="mb-8 border-b border-[var(--border)] pb-8">
            {post.series && (
              <Link
                href={`/series/${encodeURIComponent(post.series)}`}
                className="text-sm font-semibold text-brand hover:underline"
              >
                {post.series}
              </Link>
            )}
            <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--fg-muted)]">
              <span>{siteConfig.author}</span>
              <span>·</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <TagChip key={tag} tag={tag} />
                ))}
              </div>
            )}
          </header>

          {seriesPosts.length > 1 && (
            <aside className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
              <p className="mb-3 text-sm font-semibold text-brand">
                시리즈: {post.series} ({seriesIndex + 1}/{seriesPosts.length})
              </p>
              <ol className="space-y-1.5 text-sm">
                {seriesPosts.map((p, i) => (
                  <li key={p.slug}>
                    {p.slug === post.slug ? (
                      <span className="font-semibold text-[var(--fg)]">
                        {i + 1}. {p.title}
                      </span>
                    ) : (
                      <Link
                        href={`/posts/${p.slug}`}
                        className="text-[var(--fg-muted)] hover:text-brand"
                      >
                        {i + 1}. {p.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </aside>
          )}

          <PostBody html={post.html} />
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <Toc headings={post.headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}
