# idbd log

마크다운 파일로 글을 쓰는 정적 블로그. Next.js(App Router) 정적 export 기반이며, 글 작성은 곧 마크다운 파일 하나를 추가하는 일입니다.

## 기능

- `content/posts`의 마크다운 파일을 글로 발행
- 태그 / 시리즈 묶음
- 코드 하이라이팅 (Shiki, 라이트·다크 듀얼 테마)
- 다크모드 (next-themes)
- 전문 검색 (Pagefind, 서버 없이 동작)
- RSS 피드 (`/rss.xml`)

## 글 쓰기

`content/posts/` 안에 `.md` 파일을 추가합니다. 파일 이름이 곧 URL slug가 됩니다 (`my-post.md` → `/posts/my-post`).

```markdown
---
title: "글 제목"
description: "목록·검색·메타태그에 쓰이는 한 줄 요약"
date: 2026-05-28
tags: ["nextjs", "blog"]
series: "블로그 만들기"   # 선택: 같은 값이면 한 시리즈로 묶임
thumbnail: "/images/cover.png"  # 선택: 없으면 제목 첫 글자 썸네일 자동 생성
draft: false              # true면 프로덕션 빌드에서 제외
---

본문은 여기서부터. 일반 마크다운 + GFM(표, 체크박스 등)을 지원합니다.

\`\`\`ts title="example.ts" showLineNumbers
const x = 1; // title=파일명 라벨, showLineNumbers=줄 번호
\`\`\`
```

이미지는 `public/` 에 넣고 `/images/...` 처럼 절대경로로 참조합니다.

## 개발 / 빌드

```bash
npm run dev     # 개발 서버 (http://localhost:3000)
npm run build   # 정적 빌드 → out/ + Pagefind 검색 인덱스 생성
```

> 검색(Pagefind)은 빌드 결과물의 HTML을 인덱싱합니다. `npm run dev`에서는 동작하지 않고, `npm run build` 후 `out/`을 서빙해야 확인할 수 있습니다.

빌드 결과를 로컬에서 확인하려면:

```bash
npx serve out
```

## 설정

`lib/config.ts`에서 사이트 제목, 설명, 작성자, **배포 도메인(url)**, 페이지당 글 수, 내비게이션을 수정합니다. `url`은 RSS/메타데이터의 절대경로에 쓰이므로 배포 도메인으로 꼭 바꿔주세요.

## 글 쓰기 (관리자 페이지)

`/admin` 에서 GitHub 계정으로 로그인하면 브라우저에서 글을 쓰고 고치고 지울 수 있습니다. 편집기는 MDXEditor(WYSIWYG)이며, 저장하면 `content/posts/<slug>.md` 파일이 GitHub 저장소에 커밋되고 Vercel이 자동 재배포합니다. 이미지는 `public/images/<연>/<월>/` 에 함께 커밋됩니다.

로그인은 `ALLOWED_GITHUB_LOGIN` 에 지정한 GitHub 계정 하나만 통과하며, 그 계정의 OAuth 토큰으로 커밋합니다(별도 PAT 불필요).

### 설정

1. GitHub **OAuth App** 생성 (Settings → Developer settings → OAuth Apps → New)
   - Homepage URL: `https://idbdyoung.com`
   - Authorization callback URL: `https://idbdyoung.com/api/auth/callback`
2. `.env.example` 을 참고해 환경변수를 설정합니다 (로컬은 `.env.local`, Vercel은 프로젝트 Environment Variables).

| 변수 | 설명 |
| --- | --- |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth App 값 |
| `ALLOWED_GITHUB_LOGIN` | 로그인을 허용할 GitHub 아이디 |
| `GITHUB_REPO` | 글이 저장되는 저장소 (`owner/repo`) |
| `GITHUB_BRANCH` | 커밋 브랜치 (기본 `main`) |
| `SESSION_SECRET` | 세션 쿠키 암호화 키 (`openssl rand -base64 32`) |

로컬 개발에서 OAuth 로그인을 쓰려면 callback URL 이 `http://localhost:3000/api/auth/callback` 인 개발용 OAuth App 을 하나 더 만들어 `.env.local` 에 넣습니다.

## 배포

### Vercel (현재 배포 환경 · idbdyoung.com)

Vercel 프로젝트 `idbd-log` 에 GitHub 저장소를 연결해 두면 `main` 에 push 될 때마다 자동 배포됩니다. 관리자 페이지에서 저장한 글도 같은 경로로 반영됩니다.

CLI로 직접 올리려면:

```bash
npx vercel deploy --prod
```

> 관리자 페이지가 서버 기능(로그인, GitHub API)을 쓰므로 정적 export(`output: "export"`)는 더 이상 사용하지 않습니다. 블로그 본문 페이지는 빌드 시 정적 생성됩니다. 검색 인덱스(Pagefind)는 `next build` 뒤 `.next/server/app` 의 HTML을 읽어 `public/pagefind/` 에 생성됩니다.
