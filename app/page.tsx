import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/config";
import { PostGrid } from "@/components/PostGrid";
import { Pagination } from "@/components/Pagination";

export default function Home() {
  const posts = getAllPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / siteConfig.postsPerPage));
  const pagePosts = posts.slice(0, siteConfig.postsPerPage);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <PostGrid posts={pagePosts} />
      <Pagination current={1} total={totalPages} />
    </div>
  );
}
