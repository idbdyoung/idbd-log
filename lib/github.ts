import { env } from "./env";

// GitHub Contents API 래퍼. 관리자(로그인한 사용자)의 OAuth 토큰으로 저장소 파일을 읽고 쓴다.

export interface RepoFile {
  path: string;
  sha: string;
  content: string; // UTF-8 문자열
}

export interface RepoEntry {
  name: string;
  path: string;
  sha: string;
  type: "file" | "dir";
}

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

function api(token: string) {
  return async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const res = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "idbd-log-admin",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });
    if (res.status === 404) throw new GitHubError("찾을 수 없습니다.", 404);
    if (!res.ok) {
      let message = `GitHub API 오류 (${res.status})`;
      try {
        const body = (await res.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {}
      throw new GitHubError(message, res.status);
    }
    return (await res.json()) as T;
  };
}

function contentsUrl(path: string) {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `/repos/${env.repo}/contents/${encoded}?ref=${encodeURIComponent(env.branch)}`;
}

export async function listDir(token: string, dir: string): Promise<RepoEntry[]> {
  try {
    const entries = await api(token)<RepoEntry[]>(contentsUrl(dir));
    return Array.isArray(entries) ? entries : [];
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return [];
    throw e;
  }
}

export async function getFile(token: string, path: string): Promise<RepoFile | null> {
  try {
    const data = await api(token)<{ sha: string; content: string; encoding: string }>(
      contentsUrl(path)
    );
    const content = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
    return { path, sha: data.sha, content };
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return null;
    throw e;
  }
}

// 파일 생성 또는 수정. sha 가 있으면 수정, 없으면 생성.
export async function putFile(
  token: string,
  path: string,
  content: string | Buffer,
  message: string,
  sha?: string
): Promise<{ sha: string; commitUrl: string }> {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const body = {
    message,
    branch: env.branch,
    content: Buffer.from(content).toString("base64"),
    ...(sha ? { sha } : {}),
  };
  const data = await api(token)<{ content: { sha: string }; commit: { html_url: string } }>(
    `/repos/${env.repo}/contents/${encoded}`,
    { method: "PUT", body: JSON.stringify(body) }
  );
  return { sha: data.content.sha, commitUrl: data.commit.html_url };
}

export async function deleteFile(token: string, path: string, sha: string, message: string) {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  await api(token)(`/repos/${env.repo}/contents/${encoded}`, {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch: env.branch }),
  });
}
