import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { PostGrid } from "@/components/PostGrid";

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded}`,
    description: `${decoded} 태그가 달린 글`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);

  if (posts.length === 0) notFound();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="mb-8 flex items-baseline gap-3">
        <h1 className="text-2xl font-bold">#{decoded}</h1>
        <span className="text-sm text-[var(--fg-muted)]">{posts.length}개의 글</span>
        <Link href="/tags" className="ml-auto text-sm text-brand hover:underline">
          전체 태그
        </Link>
      </div>
      <PostGrid posts={posts} />
    </div>
  );
}
