import { NextResponse } from "next/server";
import Parser from "rss-parser";

interface MediumRSSItem {
  title: string;
  link: string;
  content: string;
  pubDate: string;
  categories?: string[];
  "content:encoded"?: string;
}

const MEDIUM_RSS_URL = "https://medium.com/feed/@yash.sh0031";
const parser = new Parser<{ items: MediumRSSItem[] }>();

export async function GET() {
  try {
    const feed = await parser.parseURL(MEDIUM_RSS_URL);
    const posts = feed.items.map((item) => ({
      title: item.title,
      link: item.link,
      content: item.content,
      pubDate: new Date(item.pubDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      categories: item.categories || [],
      thumbnail: item["content:encoded"]
        ? item["content:encoded"].match(/<img[^>]+src="([^">]+)"/)?.[1]
        : undefined,
    }));

    return NextResponse.json(posts);
  } catch {
    // Soft-fail so the Writing section can show its profile fallback
    // without spamming the browser console with a 500.
    return NextResponse.json([]);
  }
}
