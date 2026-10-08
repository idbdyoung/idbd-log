import Link from "next/link";
import { getSession } from "@/lib/auth";

export const metadata = { title: "관리자", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-4">
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/admin/" className="rounded-lg px-3 py-1.5 font-semibold hover:bg-[var(--bg-subtle)]">
            글 관리
          </Link>
          {session && (
            <Link
              href="/admin/new/"
              className="rounded-lg bg-brand px-3 py-1.5 font-semibold text-white hover:bg-brand-dark"
            >
              새 글
            </Link>
          )}
        </nav>
        {session && (
          <form action="/api/auth/logout" method="post" className="flex items-center gap-3 text-sm">
            <span className="text-[var(--fg-muted)]">{session.login}</span>
            <button type="submit" className="rounded-lg border border-[var(--border)] px-3 py-1.5 hover:bg-[var(--bg-subtle)]">
              로그아웃
            </button>
          </form>
        )}
      </div>
      {children}
    </div>
  );
}
