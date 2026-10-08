import { NextResponse, type NextRequest } from "next/server";
import { openSession, SESSION_COOKIE } from "@/lib/session";

// /admin 과 /api/admin 은 로그인한 관리자만 접근할 수 있다.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET ?? "";
  const session = raw && secret ? await openSession(raw, secret) : null;
  const ok = session && session.login === process.env.ALLOWED_GITHUB_LOGIN;

  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const login = new URL("/admin/login/", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
