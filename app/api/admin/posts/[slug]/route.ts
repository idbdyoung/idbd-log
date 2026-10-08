import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/lib/auth";
import { errorResponse } from "@/lib/api-utils";
import { getPost, isValidSlug, removePost, savePost, validateInput } from "@/lib/admin-posts";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const session = await requireSession();
    const { slug } = await params;
    if (!isValidSlug(slug)) return NextResponse.json({ error: "잘못된 슬러그" }, { status: 400 });
    const post = await getPost(session.token, slug);
    if (!post) return NextResponse.json({ error: "글이 없습니다." }, { status: 404 });
    return NextResponse.json({ post });
  } catch (e) {
    return errorResponse(e);
  }
}

// 수정. 슬러그가 바뀌면 새 경로에 저장하고 옛 파일을 지운다.
export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const session = await requireSession();
    const { slug } = await params;
    if (!isValidSlug(slug)) return NextResponse.json({ error: "잘못된 슬러그" }, { status: 400 });

    const input = validateInput(await request.json());
    if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });

    const existing = await getPost(session.token, slug);
    if (!existing) return NextResponse.json({ error: "글이 없습니다." }, { status: 404 });

    if (input.slug !== slug) {
      if (await getPost(session.token, input.slug)) {
        return NextResponse.json({ error: "같은 슬러그의 글이 이미 있습니다." }, { status: 409 });
      }
      const result = await savePost(session.token, input);
      await removePost(session.token, slug, existing.sha, existing.title);
      return NextResponse.json({ ok: true, slug: input.slug, ...result });
    }

    const result = await savePost(session.token, input, existing.sha);
    return NextResponse.json({ ok: true, slug, ...result });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    const session = await requireSession();
    const { slug } = await params;
    if (!isValidSlug(slug)) return NextResponse.json({ error: "잘못된 슬러그" }, { status: 400 });
    const existing = await getPost(session.token, slug);
    if (!existing) return NextResponse.json({ error: "글이 없습니다." }, { status: 404 });
    await removePost(session.token, slug, existing.sha, existing.title);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
