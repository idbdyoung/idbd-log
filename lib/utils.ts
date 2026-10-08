export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// 동적 라우트 파라미터는 퍼센트 인코딩된 채로 들어올 수 있다(한글 슬러그 등). 안전하게 디코드한다.
export function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
