export const siteConfig = {
  title: "idbd log",
  description: "마크다운으로 쓰는 개발 블로그",
  author: "idbdyoung",
  url: "https://idbdyoung.com",
  locale: "ko-KR",
  postsPerPage: 12,
  nav: [
    { label: "홈", href: "/" },
    { label: "태그", href: "/tags" },
    { label: "시리즈", href: "/series" },
    { label: "검색", href: "/search" },
  ],
} as const;
