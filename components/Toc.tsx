"use client";

import { useEffect, useState } from "react";
import type { TocHeading } from "@/lib/types";

export function Toc({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="text-sm">
      <p className="mb-3 font-semibold text-[var(--fg)]">목차</p>
      <ul className="space-y-2 border-l border-[var(--border)]">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? "1.25rem" : "0.75rem" }}>
            <a
              href={`#${h.id}`}
              className={
                activeId === h.id
                  ? "-ml-px block border-l-2 border-brand pl-2 text-brand"
                  : "-ml-px block border-l-2 border-transparent pl-2 text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
              }
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
