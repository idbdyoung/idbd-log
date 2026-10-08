import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 관리자 페이지(로그인·글 저장)가 서버 기능을 쓰므로 정적 export는 사용하지 않는다.
  // 블로그 본문 페이지는 generateStaticParams로 빌드 시 정적 생성된다.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["shiki"],
};

export default nextConfig;
