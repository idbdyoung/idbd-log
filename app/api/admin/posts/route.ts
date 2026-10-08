import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/lib/auth";
import { errorResponse } from "@/lib/api-utils";
import { getPost, listPosts, savePost, validateInput } from "@/lib/admin-posts";

export async function GET() {
  try {
    const session = await requireSession();
    const posts = await listPosts(session.token);
    return NextResponse.json({ posts: posts.map((p) => ({ ...p, body: undefined })) });
  } catch (e) {
    return errorResponse(e);
  }
}

// 새 글 생성
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const input = validateInput(await request.json());
    if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });

    if (await getPost(session.token, input.slug)) {
      return NextResponse.json({ error: "같은 슬러그의 글이 이미 있습니다." }, { status: 409 });
    }
    const result = await savePost(session.token, input);
    return NextResponse.json({ ok: true, slug: input.slug, ...result }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
