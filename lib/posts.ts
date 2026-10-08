import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { renderMarkdown, extractHeadings } from "./markdown";
import type { Post, PostMeta } from "./types";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function readPostFiles(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function slugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, "");
}

function parseMeta(filename: string): { meta: PostMeta; content: string } {
  const fullPath = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  const meta: PostMeta = {
    slug: slugFromFilename(filename),
    title: data.title ?? "제목 없음",
    description: data.description ?? "",
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    series: data.series ? String(data.series) : undefined,
    thumbnail: data.thumbnail ? String(data.thumbnail) : undefined,
    draft: Boolean(data.draft),
    readingTime: readingTime(content).text,
  };

  return { meta, content };
}

const isProd = process.env.NODE_ENV === "production";

export function getAllPosts(): PostMeta[] {
  return readPostFiles()
    .map((file) => parseMeta(file).meta)
    .filter((meta) => !meta.draft || !isProd)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const file = readPostFiles().find((f) => slugFromFilename(f) === slug);
  if (!file) return null;

  const { meta, content } = parseMeta(file);
  const html = await renderMarkdown(content);
  const headings = extractHeadings(content);

  return { ...meta, html, headings };
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}

export function getAllSeries(): { series: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    if (!post.series) continue;
    counts.set(post.series, (counts.get(post.series) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([series, count]) => ({ series, count }))
    .sort((a, b) => a.series.localeCompare(b.series));
}

// 시리즈 내부는 오래된 글부터(연재 순서) 정렬
export function getPostsBySeries(series: string): PostMeta[] {
  return getAllPosts()
    .filter((p) => p.series === series)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));
}
