import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/config";
import { PostGrid } from "@/components/PostGrid";
import { Pagination } from "@/components/Pagination";

function totalPages() {
  const count = getAllPosts().length;
  return Math.max(1, Math.ceil(count / siteConfig.postsPerPage));
}

// 1..N 모두 생성한다. 빈 배열은 output: export에서 빌드 에러를 내므로
// 글이 적어도 최소 1개(page 1) 파라미터가 보장된다.
export function generateStaticParams() {
  return Array.from({ length: totalPages() }, (_, i) => ({
    page: String(i + 1),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  // 1페이지는 "/"가 정본(canonical)
  if (page === "1") {
    return { title: "홈", alternates: { canonical: "/" } };
  }
  return { title: `${page}페이지` };
}

export default async function PagedHome({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const current = Number(page);
  const total = totalPages();

  if (!Number.isInteger(current) || current < 1 || current > total) {
    notFound();
  }

  const posts = getAllPosts();
  const start = (current - 1) * siteConfig.postsPerPage;
  const pagePosts = posts.slice(start, start + siteConfig.postsPerPage);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <PostGrid posts={pagePosts} />
      <Pagination current={current} total={total} />
    </div>
  );
}
