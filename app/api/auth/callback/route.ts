import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { sealSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

const STATE_COOKIE = "idbd_oauth_state";

function fail(request: NextRequest, reason: string) {
  const url = new URL("/admin/login/", request.url);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const stored = request.cookies.get(STATE_COOKIE)?.value;

  let next = "/admin/";
  try {
    const parsed = stored ? (JSON.parse(stored) as { state: string; next: string }) : null;
    if (!code || !state || !parsed || parsed.state !== state) return fail(request, "state");
    if (parsed.next.startsWith("/")) next = parsed.next;
  } catch {
    return fail(request, "state");
  }

  // code → access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
      redirect_uri: new URL("/api/auth/callback/", request.url).toString(),
    }),
  });
  const tokenJson = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenJson.access_token) return fail(request, tokenJson.error ?? "token");

  // 토큰 주인이 허용된 계정인지 확인
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "idbd-log-admin",
    },
  });
  const user = (await userRes.json()) as { login?: string; name?: string; avatar_url?: string };
  if (!user.login || user.login.toLowerCase() !== env.allowedLogin.toLowerCase()) {
    return fail(request, "forbidden");
  }

  const sealed = await sealSession(
    {
      login: user.login,
      name: user.name ?? user.login,
      avatar: user.avatar_url ?? "",
      token: tokenJson.access_token,
    },
    env.sessionSecret
  );

  const res = NextResponse.redirect(new URL(next, request.url));
  res.cookies.set(SESSION_COOKIE, sealed, sessionCookieOptions);
  res.cookies.delete(STATE_COOKIE);
  return res;
}
