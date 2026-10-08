"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { MDXEditorMethods } from "@mdxeditor/editor";

// MDXEditor는 브라우저 전용(contenteditable)이므로 클라이언트에서만 로드한다.
const MarkdownEditor = dynamic(
  () => import("./MarkdownEditor").then((m) => m.MarkdownEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[60vh] animate-pulse rounded-xl bg-[var(--bg-subtle)]" />
    ),
  }
);

export interface EditorValues {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  series: string;
  thumbnail: string;
  draft: boolean;
  body: string;
}

interface Props {
  mode: "create" | "edit";
  originalSlug?: string;
  initial: EditorValues;
}

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; slug: string; commitUrl: string }
  | { kind: "error"; message: string };

export function PostEditor({ mode, originalSlug, initial }: Props) {
  const router = useRouter();
  const editorRef = useRef<MDXEditorMethods>(null);
  const [values, setValues] = useState<EditorValues>(initial);
  const [tagsText, setTagsText] = useState(initial.tags.join(", "));
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dirty, setDirty] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  function update<K extends keyof EditorValues>(key: K, value: EditorValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setDirty(true);
  }

  // 저장하지 않은 변경이 있으면 이탈 경고
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Cmd/Ctrl+S 로 저장
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  async function save() {
    if (status.kind === "saving") return;
    const body = editorRef.current?.getMarkdown() ?? values.body;
    const payload = {
      ...values,
      body,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    };
    setStatus({ kind: "saving" });

    const url =
      mode === "create"
        ? "/api/admin/posts/"
        : `/api/admin/posts/${encodeURIComponent(originalSlug!)}/`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as {
      error?: string;
      slug?: string;
      commitUrl?: string;
    };
    if (!res.ok) {
      setStatus({ kind: "error", message: json.error ?? `저장 실패 (${res.status})` });
      return;
    }
    setDirty(false);
    setStatus({ kind: "saved", slug: json.slug ?? payload.slug, commitUrl: json.commitUrl ?? "" });
    if (mode === "create" || json.slug !== originalSlug) {
      router.replace(`/admin/edit/${json.slug}/`);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none transition-colors focus:border-brand";
  const labelCls = "mb-1 block text-xs font-semibold text-[var(--fg-muted)]";

  return (
    <div className="space-y-6">
      {/* 상단 바: 상태 + 저장 */}
      <div className="sticky top-16 z-30 -mx-5 flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--bg)]/90 px-5 py-3 backdrop-blur">
        <div className="min-w-0 text-sm">
          {status.kind === "saving" && <span className="text-[var(--fg-muted)]">GitHub에 커밋 중…</span>}
          {status.kind === "saved" && (
            <span className="text-brand">
              저장됨. 1분 안팎으로 사이트에 반영됩니다.{" "}
              {status.commitUrl && (
                <a href={status.commitUrl} target="_blank" rel="noreferrer" className="underline">
                  커밋 보기
                </a>
              )}
            </span>
          )}
          {status.kind === "error" && <span className="text-red-600">{status.message}</span>}
          {status.kind === "idle" && dirty && <span className="text-[var(--fg-muted)]">저장되지 않은 변경</span>}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={values.draft}
              onChange={(e) => update("draft", e.target.checked)}
              className="accent-brand"
            />
            초안
          </label>
          <button
            type="button"
            onClick={() => void save()}
            disabled={status.kind === "saving"}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {mode === "create" ? "발행" : "저장"}
          </button>
        </div>
      </div>

      {/* 제목 */}
      <input
        type="text"
        value={values.title}
        onChange={(e) => {
          // 슬러그를 직접 고치기 전까지는 제목에서 자동 생성
          const title = e.target.value;
          setValues((v) => ({ ...v, title, slug: slugTouched ? v.slug : slugify(title) }));
          setDirty(true);
        }}
        placeholder="제목"
        className="w-full bg-transparent text-3xl font-extrabold leading-tight outline-none placeholder:text-[var(--fg-muted)]/50 sm:text-4xl"
      />

      {/* 메타 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>요약 (목록·검색·메타태그)</label>
          <input
            type="text"
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>슬러그 (URL: /posts/{values.slug || "…"})</label>
          <input
            type="text"
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", e.target.value);
            }}
            className={`${inputCls} font-mono`}
          />
        </div>
        <div>
          <label className={labelCls}>날짜</label>
          <input
            type="date"
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>태그 (쉼표로 구분)</label>
          <input
            type="text"
            value={tagsText}
            onChange={(e) => {
              setTagsText(e.target.value);
              setDirty(true);
            }}
            placeholder="nextjs, blog"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>시리즈 (선택)</label>
          <input
            type="text"
            value={values.series}
            onChange={(e) => update("series", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>썸네일 경로 (선택, 예: /images/cover.png)</label>
          <input
            type="text"
            value={values.thumbnail}
            onChange={(e) => update("thumbnail", e.target.value)}
            className={`${inputCls} font-mono`}
          />
        </div>
      </div>

      {/* 본문 편집기 */}
      {parseError && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          편집기가 일부 마크다운을 해석하지 못했습니다. 툴바 오른쪽의 소스 보기로 전환해 수정하세요. ({parseError})
        </p>
      )}
      <div className="border-t border-[var(--border)] pt-6">
        <MarkdownEditor
          ref={editorRef}
          markdown={initial.body}
          placeholder="본문을 여기에 쓰세요. '/'나 마크다운 문법(#, -, ```)을 그대로 쓸 수 있습니다."
          onChange={(md, isInitial) => {
            setValues((v) => ({ ...v, body: md }));
            if (!isInitial) setDirty(true);
          }}
          onError={(e) => setParseError(e.error)}
          suppressHtmlProcessing
          trim={false}
        />
      </div>
    </div>
  );
}
