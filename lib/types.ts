export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO 8601
  tags: string[];
  series?: string;
  thumbnail?: string;
  draft: boolean;
  readingTime: string;
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export interface Post extends PostMeta {
  html: string;
  headings: TocHeading[];
}
