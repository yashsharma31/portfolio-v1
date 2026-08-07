export interface MediumPost {
  title: string;
  link: string;
  content: string;
  pubDate: string;
  categories: string[];
  thumbnail?: string;
}

export async function getMediumPosts(): Promise<MediumPost[]> {
  try {
    const response = await fetch("/api/medium");
    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data as MediumPost[];
  } catch {
    // Soft-fail: WritingRows shows the Medium profile fallback.
    return [];
  }
}
