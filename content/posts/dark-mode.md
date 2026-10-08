---
title: "next-themes로 다크모드 구현하기"
description: "깜빡임 없는 다크모드를 만드는 방법과 Tailwind v4 연동을 다룹니다."
date: 2026-05-30
tags: ["nextjs", "css", "다크모드"]
draft: false
---

## 깜빡임(FOUC) 없애기

다크모드의 핵심은 첫 페인트 전에 테마를 결정하는 것입니다. `next-themes`는 `<head>`에 작은 스크립트를 주입해 이 문제를 해결합니다.

```tsx title="components/ThemeProvider.tsx"
<NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</NextThemeProvider>
```

`attribute="class"`로 두면 `html` 태그에 `.dark` 클래스가 토글됩니다.

## Tailwind v4 연동

Tailwind v4에서는 커스텀 variant로 클래스 전략을 선언합니다.

```css title="globals.css"
@custom-variant dark (&:where(.dark, .dark *));
```

이제 `dark:bg-black` 같은 유틸리티가 `.dark` 클래스 기준으로 동작합니다.

- [x] FOUC 제거
- [x] 시스템 테마 추종
- [ ] 사용자가 직접 토글
