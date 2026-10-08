import { Feed } from "feed";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-static";

export function GET() {
  const feed = new Feed({
    title: siteConfig.title,
    description: siteConfig.description,
    id: siteConfig.url,
    link: siteConfig.url,
    language: "ko",
    copyright: `© ${new Date().getFullYear()} ${siteConfig.author}`,
    feedLinks: {
      rss2: `${siteConfig.url}/rss.xml`,
    },
    author: {
      name: siteConfig.author,
    },
  });

  for (const post of getAllPosts()) {
    const url = `${siteConfig.url}/posts/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      date: new Date(post.date),
      category: post.tags.map((name) => ({ name })),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
