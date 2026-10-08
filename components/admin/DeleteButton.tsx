"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}/`, { method: "DELETE" });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "삭제 실패");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
      >
        삭제
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2 text-sm">
      <span className="text-[var(--fg-muted)]">“{title}” 삭제?</span>
      <button
        type="button"
        disabled={busy}
        onClick={remove}
        className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
      >
        {busy ? "삭제 중…" : "확인"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-[var(--border)] px-3 py-1.5 hover:bg-[var(--bg-subtle)]"
      >
        취소
      </button>
      {error && <span className="text-red-600">{error}</span>}
    </span>
  );
}
