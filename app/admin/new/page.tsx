import { PostEditor } from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <PostEditor
      mode="create"
      initial={{
        slug: "",
        title: "",
        description: "",
        date: today,
        tags: [],
        series: "",
        thumbnail: "",
        draft: false,
        body: "",
      }}
    />
  );
}
