import { getCollection } from "astro:content";
import type { UnifiedArticle } from "@/data/mockArticles";

async function getAllArticles(): Promise<UnifiedArticle[]> {
  const [blogPosts, notes, travelPosts] = await Promise.all([
    getCollection("blog"),
    getCollection("notes"),
    getCollection("travel"),
  ]);

  const allArticles: UnifiedArticle[] = [
    ...blogPosts.map((post) => ({
      id: post.id,
      data: {
        title: post.data.title,
        tags: post.data.tags,
        description: post.data.description,
        date: post.data.date,
      },
      body: post.body,
      slug: post.slug,
      collection: "blog" as const,
      filePath: post.id,
    })),
    ...notes.map((note) => ({
      id: note.id,
      data: {
        title: note.data.title,
        tags: note.data.tags,
        description: note.data.description,
        date: note.data.date,
      },
      body: note.body,
      slug: note.slug,
      collection: "notes" as const,
      filePath: note.id,
    })),
    ...travelPosts.map((travel) => ({
      id: travel.id,
      data: {
        title: travel.data.title,
        tags: travel.data.tags,
        description: travel.data.description,
        area: travel.data.area,
        difficulty: travel.data.difficulty,
        date: travel.data.date,
      },
      body: travel.body,
      slug: travel.slug,
      collection: "travel" as const,
      filePath: travel.id,
    })),
  ];

  return allArticles;
}

export async function GET(request: Request) {
  try {
    const articles = await getAllArticles();
    return new Response(JSON.stringify(articles), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch articles" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
