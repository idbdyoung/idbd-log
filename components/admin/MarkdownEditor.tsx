"use client";

import { forwardRef } from "react";
import {
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  StrikeThroughSupSubToggles,
  CodeToggle,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  InsertCodeBlock,
  ChangeCodeMirrorLanguage,
  ConditionalContents,
  DiffSourceToggleWrapper,
  Separator,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

const CODE_LANGUAGES: Record<string, string> = {
  "": "text",
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  json: "JSON",
  html: "HTML",
  css: "CSS",
  bash: "Bash",
  sh: "Shell",
  md: "Markdown",
  yaml: "YAML",
  sql: "SQL",
  py: "Python",
  go: "Go",
  rust: "Rust",
  java: "Java",
  kotlin: "Kotlin",
  swift: "Swift",
  diff: "Diff",
};

// 이미지를 저장소에 커밋하고 사이트 경로를 돌려준다.
async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/upload/", { method: "POST", body: form });
  const json = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? "이미지 업로드 실패");
  return json.url;
}

// 아직 배포 전인 이미지(/images/...)도 미리보기로 보이도록 저장소에서 직접 가져온다.
async function previewImage(src: string): Promise<string> {
  if (src.startsWith("/images/")) return `/api/admin/raw/?src=${encodeURIComponent(src)}`;
  return src;
}

// 블로그 본문(PostBody)과 같은 prose 스타일을 편집 영역에 그대로 적용한다.
const PROSE =
  "prose prose-zinc max-w-none dark:prose-invert " +
  "prose-headings:font-bold prose-a:text-brand prose-a:no-underline " +
  "prose-img:rounded-xl prose-code:before:content-none prose-code:after:content-none " +
  "min-h-[60vh] px-0 py-2 outline-none";

type Props = Omit<MDXEditorProps, "plugins" | "contentEditableClassName">;

export const MarkdownEditor = forwardRef<MDXEditorMethods, Props>(function MarkdownEditor(
  props,
  ref
) {
  return (
    <MDXEditor
      ref={ref}
      {...props}
      className="idbd-editor"
      contentEditableClassName={PROSE}
      plugins={[
        headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4] }),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin({ imageUploadHandler: uploadImage, imagePreviewHandler: previewImage }),
        tablePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "ts" }),
        codeMirrorPlugin({ codeBlockLanguages: CODE_LANGUAGES }),
        diffSourcePlugin({ viewMode: "rich-text" }),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper>
              <UndoRedo />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <BoldItalicUnderlineToggles />
              <StrikeThroughSupSubToggles options={["Strikethrough"]} />
              <CodeToggle />
              <Separator />
              <ListsToggle />
              <Separator />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertThematicBreak />
              <Separator />
              <ConditionalContents
                options={[
                  { when: (editor) => editor?.editorType === "codeblock", contents: () => <ChangeCodeMirrorLanguage /> },
                  { fallback: () => <InsertCodeBlock /> },
                ]}
              />
            </DiffSourceToggleWrapper>
          ),
        }),
      ]}
    />
  );
});
