import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/lib/auth";
import { errorResponse } from "@/lib/api-utils";
import { env } from "@/lib/env";

// 아직 배포되지 않은 저장소 이미지(/images/...)를 편집기 미리보기용으로 전달한다.
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const src = request.nextUrl.searchParams.get("src") ?? "";
    if (!src.startsWith("/images/") || src.includes("..")) {
      return NextResponse.json({ error: "잘못된 경로" }, { status: 400 });
    }
    const path = `public${src}`.split("/").map(encodeURIComponent).join("/");
    const res = await fetch(
      `https://api.github.com/repos/${env.repo}/contents/${path}?ref=${encodeURIComponent(env.branch)}`,
      {
        headers: {
          Authorization: `Bearer ${session.token}`,
          Accept: "application/vnd.github.raw+json",
          "User-Agent": "idbd-log-admin",
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return new NextResponse(null, { status: res.status });
    const ext = src.split(".").pop()?.toLowerCase() ?? "";
    const type =
      { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", avif: "image/avif" }[ext] ?? "application/octet-stream";
    return new NextResponse(await res.arrayBuffer(), {
      headers: { "Content-Type": type, "Cache-Control": "private, max-age=300" },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
