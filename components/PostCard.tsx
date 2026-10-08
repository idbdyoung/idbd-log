import Link from "next/link";
import type { PostMeta } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
      <Link href={`/posts/${post.slug}`} className="flex h-full flex-col">
        {post.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnail}
            alt={post.title}
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-brand/15 to-brand/5 text-3xl font-bold text-brand/40">
            {post.title.charAt(0)}
          </div>
        )}

        <div className="flex flex-1 flex-col p-5">
          {post.series && (
            <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">
              {post.series}
            </span>
          )}
          <h2 className="line-clamp-2 text-lg font-bold leading-snug">
            {post.title}
          </h2>
          {post.description && (
            <p className="mt-2 line-clamp-2 text-sm text-[var(--fg-muted)]">
              {post.description}
            </p>
          )}

          <div className="mt-auto pt-4">
            {post.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--bg-subtle)] px-2 py-0.5 text-xs text-[var(--fg-muted)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)]">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
