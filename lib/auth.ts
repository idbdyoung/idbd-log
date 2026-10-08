import { cookies } from "next/headers";
import { env } from "./env";
import { openSession, SESSION_COOKIE, type Session } from "./session";

// 서버 컴포넌트·라우트 핸들러에서 현재 세션을 읽는다. 없으면 null.
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const session = await openSession(raw, env.sessionSecret);
  if (!session || session.login !== env.allowedLogin) return null;
  return session;
}

export class UnauthorizedError extends Error {}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError("로그인이 필요합니다.");
  return session;
}
