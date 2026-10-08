import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getPost, isValidSlug } from "@/lib/admin-posts";
import { PostEditor } from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  const session = await requireSession();
  const post = await getPost(session.token, slug);
  if (!post) notFound();

  return (
    <PostEditor
      mode="edit"
      originalSlug={slug}
      initial={{
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        tags: post.tags,
        series: post.series ?? "",
        thumbnail: post.thumbnail ?? "",
        draft: post.draft,
        body: post.body,
      }}
    />
  );
}
