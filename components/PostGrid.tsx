import type { PostMeta } from "@/lib/types";
import { PostCard } from "./PostCard";

export function PostGrid({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return (
      <p className="py-20 text-center text-[var(--fg-muted)]">
        아직 작성된 글이 없습니다.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
