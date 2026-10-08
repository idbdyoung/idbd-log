import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "태그",
  description: "태그로 글 둘러보기",
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="mb-8 text-2xl font-bold">태그</h1>

      {tags.length === 0 ? (
        <p className="text-[var(--fg-muted)]">아직 태그가 없습니다.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm transition-colors hover:border-brand hover:text-brand"
            >
              <span className="font-medium">#{tag}</span>
              <span className="text-xs text-[var(--fg-muted)]">{count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
