---
title: "블로그를 시작하며"
description: "마크다운으로 쓰고 정적 사이트로 배포하는 개발 블로그를 만들었습니다."
date: 2026-05-28
tags: ["블로그", "nextjs"]
series: "블로그 만들기"
draft: false
---

## 왜 마크다운 블로그인가

글은 `content/posts` 폴더 안에 마크다운 파일로 저장됩니다. 글을 쓰는 일이 곧 파일을 하나 추가하는 일이 되고, Git 커밋이 곧 발행이 됩니다.

> 데이터베이스도, 관리자 페이지도 필요 없습니다. 텍스트 에디터만 있으면 됩니다.

## 기능

- 태그와 시리즈로 글을 묶기
- 코드 하이라이팅
- 다크모드
- 전문 검색과 RSS

### 코드 예시

```ts title="greet.ts"
function greet(name: string): string {
  return `안녕하세요, ${name}님!`;
}

console.log(greet("idbdyoung"));
```

인라인 코드는 이렇게 `const x = 1` 표시됩니다.

## 다음 글에서

다음 글에서는 마크다운 파이프라인을 어떻게 구성했는지 살펴봅니다.
