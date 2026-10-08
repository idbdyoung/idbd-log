import { NextResponse } from "next/server";
import { UnauthorizedError } from "./auth";
import { GitHubError } from "./github";

export function errorResponse(e: unknown) {
  if (e instanceof UnauthorizedError) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
  if (e instanceof GitHubError) {
    return NextResponse.json({ error: e.message }, { status: e.status === 404 ? 404 : 502 });
  }
  const message = e instanceof Error ? e.message : "알 수 없는 오류";
  return NextResponse.json({ error: message }, { status: 500 });
}
