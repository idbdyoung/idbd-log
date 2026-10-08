"use client";

import { useEffect, useRef } from "react";

export function PostBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const figures = root.querySelectorAll<HTMLElement>(
      "[data-rehype-pretty-code-figure]"
    );

    const cleanups: (() => void)[] = [];

    figures.forEach((figure) => {
      if (figure.querySelector(".copy-btn")) return;
      const pre = figure.querySelector("pre");
      if (!pre) return;

      figure.style.position = "relative";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.setAttribute("aria-label", "코드 복사");
      btn.textContent = "복사";

      const onClick = async () => {
        const code = pre.querySelector("code")?.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = "복사됨!";
          setTimeout(() => (btn.textContent = "복사"), 1500);
        } catch {
          btn.textContent = "실패";
          setTimeout(() => (btn.textContent = "복사"), 1500);
        }
      };

      btn.addEventListener("click", onClick);
      figure.appendChild(btn);
      cleanups.push(() => {
        btn.removeEventListener("click", onClick);
        btn.remove();
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [html]);

  return (
    <div
      ref={ref}
      className="prose prose-zinc max-w-none dark:prose-invert
        prose-headings:scroll-mt-20 prose-headings:font-bold
        prose-a:text-brand prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-xl prose-pre:p-0 prose-pre:bg-transparent
        prose-code:before:content-none prose-code:after:content-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
