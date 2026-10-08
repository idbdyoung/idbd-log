import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

const STATE_COOKIE = "idbd_oauth_state";

// GitHub OAuth 시작: state 쿠키를 심고 GitHub 인가 페이지로 보낸다.
export function GET(request: NextRequest) {
  const state = crypto.randomUUID();
  const next = request.nextUrl.searchParams.get("next") ?? "/admin/";

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.githubClientId);
  authorize.searchParams.set("redirect_uri", new URL("/api/auth/callback/", request.url).toString());
  authorize.searchParams.set("scope", "repo");
  authorize.searchParams.set("state", state);

  const res = NextResponse.redirect(authorize);
  res.cookies.set(STATE_COOKIE, JSON.stringify({ state, next }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
