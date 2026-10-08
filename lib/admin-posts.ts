import matter from "gray-matter";
import { deleteFile, getFile, listDir, putFile } from "./github";

export const POSTS_DIR = "content/posts";

export interface PostInput {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  series?: string;
  thumbnail?: string;
  draft: boolean;
  body: string;
}

export interface AdminPost extends PostInput {
  sha: string;
}

const SLUG_RE = /^[\p{L}\p{N}][\p{L}\p{N}\-_.]*$/u;

export function isValidSlug(slug: string) {
  return SLUG_RE.test(slug) && !slug.includes("..");
}

export function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toDateOnly(value: unknown): string {
  const d = value ? new Date(value as string) : new Date();
  return Number.isNaN(d.getTime())
    ? new Date().toISOString().slice(0, 10)
    : d.toISOString().slice(0, 10);
}

export function parsePost(slug: string, raw: string, sha: string): AdminPost {
  const { data, content } = matter(raw);
  return {
    slug,
    sha,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    date: toDateOnly(data.date),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    series: data.series ? String(data.series) : undefined,
    thumbnail: data.thumbnail ? String(data.thumbnail) : undefined,
    draft: Boolean(data.draft),
    body: content.replace(/^\n+/, ""),
  };
}

// MDXEditor의 ``` 단축 입력 버그로 코드 펜스 언어가 "```"(또는 &#x60; 엔티티)로 저장되는 경우를 정리한다.
export function normalizeBody(body: string): string {
  return body.replace(/^(\s*)```(?:`{3}|(?:&#x60;){3})[ \t]*$/gm, "$1```");
}

export function serializePost(input: PostInput): string {
  const data: Record<string, unknown> = {
    title: input.title,
    description: input.description,
    date: input.date,
    tags: input.tags,
  };
  if (input.series) data.series = input.series;
  if (input.thumbnail) data.thumbnail = input.thumbnail;
  data.draft = input.draft;
  const body = normalizeBody(input.body).trimEnd() + "\n";
  return matter.stringify("\n" + body, data);
}

export async function listPosts(token: string): Promise<AdminPost[]> {
  const entries = await listDir(token, POSTS_DIR);
  const files = entries.filter((e) => e.type === "file" && /\.mdx?$/.test(e.name));
  const posts = await Promise.all(
    files.map(async (e) => {
      const file = await getFile(token, e.path);
      return file ? parsePost(e.name.replace(/\.mdx?$/, ""), file.content, file.sha) : null;
    })
  );
  return posts
    .filter((p): p is AdminPost => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export async function getPost(token: string, slug: string): Promise<AdminPost | null> {
  const file = await getFile(token, `${POSTS_DIR}/${slug}.md`);
  return file ? parsePost(slug, file.content, file.sha) : null;
}

export async function savePost(token: string, input: PostInput, sha?: string) {
  const path = `${POSTS_DIR}/${input.slug}.md`;
  const message = sha ? `post: ${input.title} 수정` : `post: ${input.title}`;
  return putFile(token, path, serializePost(input), message, sha);
}

export async function removePost(token: string, slug: string, sha: string, title: string) {
  await deleteFile(token, `${POSTS_DIR}/${slug}.md`, sha, `post: ${title} 삭제`);
}

// API 입력 검증. 오류면 메시지 문자열을 돌려준다.
export function validateInput(json: unknown): PostInput | string {
  const d = (json ?? {}) as Record<string, unknown>;
  const slug = String(d.slug ?? "").trim();
  const title = String(d.title ?? "").trim();
  if (!title) return "제목을 입력하세요.";
  if (!isValidSlug(slug)) return "슬러그는 글자·숫자·하이픈만 사용할 수 있습니다.";
  const date = String(d.date ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "날짜 형식이 올바르지 않습니다.";
  return {
    slug,
    title,
    description: String(d.description ?? "").trim(),
    date,
    tags: Array.isArray(d.tags) ? d.tags.map((t) => String(t).trim()).filter(Boolean) : [],
    series: d.series ? String(d.series).trim() || undefined : undefined,
    thumbnail: d.thumbnail ? String(d.thumbnail).trim() || undefined : undefined,
    draft: Boolean(d.draft),
    body: String(d.body ?? ""),
  };
}
