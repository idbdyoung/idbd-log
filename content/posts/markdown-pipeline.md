---
title: "마크다운 파이프라인 뜯어보기"
description: "remark, rehype, Shiki로 마크다운을 HTML로 변환하는 과정을 정리합니다."
date: 2026-05-29
tags: ["nextjs", "markdown", "shiki"]
series: "블로그 만들기"
draft: false
---

## unified 생태계

마크다운을 HTML로 바꾸는 일은 `unified` 파이프라인으로 처리합니다. 크게 세 단계입니다.

1. **remark** — 마크다운을 파싱해 mdast(트리)로 변환
2. **rehype** — mdast를 hast(HTML 트리)로 변환
3. **stringify** — hast를 HTML 문자열로 직렬화

```ts title="lib/markdown.ts" showLineNumbers
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypePrettyCode, {
    theme: { dark: "github-dark-dimmed", light: "github-light" },
  })
  .use(rehypeStringify);
```

## 코드 하이라이팅

`rehype-pretty-code`는 내부적으로 **Shiki**를 사용합니다. VS Code와 동일한 테마 엔진이라 결과물이 깔끔합니다.

| 도구 | 역할 |
| --- | --- |
| remark-gfm | 표, 체크박스 등 GFM 지원 |
| rehype-slug | 헤딩에 id 부여 |
| rehype-pretty-code | Shiki 기반 코드 하이라이팅 |

### 빌드 타임 렌더링

정적 export이므로 모든 변환은 빌드 시점에 한 번만 일어납니다. 런타임 비용이 0입니다.

## 정리

마크다운 한 장이 HTML로 바뀌는 길을 따라가 봤습니다. 다음은 검색입니다.
