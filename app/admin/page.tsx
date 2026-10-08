import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { listPosts } from "@/lib/admin-posts";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const session = await requireSession();
  let posts: Awaited<ReturnType<typeof listPosts>> = [];
  let loadError: string | null = null;
  try {
    posts = await listPosts(session.token);
  } catch (e) {
    loadError = e instanceof Error ? e.message : "글 목록을 불러오지 못했습니다.";
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-xl font-bold">글 목록</h1>
        <span className="text-sm text-[var(--fg-muted)]">{posts.length}개</span>
      </div>

      {loadError && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          GitHub에서 글 목록을 불러오지 못했습니다: {loadError}
        </p>
      )}
      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--fg-muted)]">
          아직 글이 없습니다.{" "}
          <Link href="/admin/new/" className="text-brand hover:underline">
            첫 글 쓰기
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--card)]">
          {posts.map((post) => (
            <li key={post.slug} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/edit/${post.slug}/`} className="truncate font-semibold hover:text-brand">
                    {post.title || post.slug}
                  </Link>
                  {post.draft && (
                    <span className="rounded-md bg-[var(--bg-subtle)] px-1.5 py-0.5 text-xs text-[var(--fg-muted)]">
                      초안
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-[var(--fg-muted)]">
                  <span>{post.date}</span>
                  <span>/posts/{post.slug}</span>
                  {post.series && <span>시리즈: {post.series}</span>}
                  {post.tags.length > 0 && <span>{post.tags.map((t) => `#${t}`).join(" ")}</span>}
                </div>
              </div>
              <Link
                href={`/posts/${post.slug}/`}
                target="_blank"
                className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]"
              >
                보기
              </Link>
              <Link
                href={`/admin/edit/${post.slug}/`}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--bg-subtle)]"
              >
                수정
              </Link>
              <DeleteButton slug={post.slug} title={post.title} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
