import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-5 py-32 text-center">
      <p className="text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-[var(--fg-muted)]">
        요청하신 페이지가 없거나 이동되었습니다.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
