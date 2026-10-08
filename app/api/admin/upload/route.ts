import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/lib/auth";
import { errorResponse } from "@/lib/api-utils";
import { putFile } from "@/lib/github";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml", "image/avif"]);

// 이미지를 저장소의 public/images/<yyyy>/<mm>/ 에 커밋하고 사이트 경로(/images/...)를 돌려준다.
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "지원하지 않는 이미지 형식입니다." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "이미지는 8MB 이하여야 합니다." }, { status: 400 });

    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    const base = file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}-]+/gu, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "image";
    const name = `${base}-${now.getTime().toString(36)}.${ext}`;
    const repoPath = `public/images/${yyyy}/${mm}/${name}`;

    await putFile(session.token, repoPath, Buffer.from(await file.arrayBuffer()), `image: ${name}`);
    return NextResponse.json({ url: `/images/${yyyy}/${mm}/${name}` });
  } catch (e) {
    return errorResponse(e);
  }
}
