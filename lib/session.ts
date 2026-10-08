import { EncryptJWT, jwtDecrypt } from "jose";

export const SESSION_COOKIE = "idbd_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30일

export interface Session {
  login: string;
  name: string;
  avatar: string;
  token: string; // GitHub OAuth access token (커밋에 사용)
}

// 어떤 길이의 비밀 문자열이든 32바이트 키로 만든다.
async function key(secret: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return new Uint8Array(digest);
}

export async function sealSession(session: Session, secret: string): Promise<string> {
  return new EncryptJWT({ ...session })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .encrypt(await key(secret));
}

export async function openSession(jwe: string, secret: string): Promise<Session | null> {
  try {
    const { payload } = await jwtDecrypt(jwe, await key(secret));
    if (typeof payload.login !== "string" || typeof payload.token !== "string") return null;
    return {
      login: payload.login,
      name: String(payload.name ?? payload.login),
      avatar: String(payload.avatar ?? ""),
      token: payload.token,
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
