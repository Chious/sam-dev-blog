/**
 * 文章推薦工具
 * 根據當前文章獲取上一篇和下一篇文章
 */

import type { CollectionEntry } from "astro:content";

export interface ArticleRecommendation {
  title: string;
  slug: string;
  description?: string;
  date?: Date;
  category?: string;
  tags?: string[];
  image?: string;
}

export interface ArticleRecommendations {
  previous?: ArticleRecommendation;
  next?: ArticleRecommendation;
}

/**
 * 獲取文章推薦（上一篇和下一篇）
 * @param currentSlug 當前文章的 slug
 * @param currentCategory 當前文章的分類
 * @param allArticles 所有文章列表
 * @returns 文章推薦對象
 */
export function getArticleRecommendations(
  currentSlug: string,
  currentCategory: string,
  allArticles: CollectionEntry<any>[]
): ArticleRecommendations {
  // 過濾出同分類的文章
  const categoryArticles = allArticles.filter((article) => {
    const pathParts = (article as any).slug.split("/");
    const category = pathParts[0];
    return category === currentCategory;
  });

  // 按日期排序（有日期的優先，然後按時間倒序）
  const sortedArticles = categoryArticles.sort((a, b) => {
    // 如果都有日期，按日期倒序
    if ((a as any).data.date && (b as any).data.date) {
      return (
        new Date((b as any).data.date).getTime() -
        new Date((a as any).data.date).getTime()
      );
    }
    // 有日期的排在前面
    if ((a as any).data.date && !(b as any).data.date) return -1;
    if (!(a as any).data.date && (b as any).data.date) return 1;
    // 都沒有日期時按標題排序
    return (a as any).data.title.localeCompare((b as any).data.title);
  });

  // 找到當前文章的索引
  const currentIndex = sortedArticles.findIndex(
    (article) => (article as any).slug === currentSlug
  );

  if (currentIndex === -1) {
    return {}; // 找不到當前文章
  }

  const recommendations: ArticleRecommendations = {};

  // 獲取上一篇（索引 + 1，因為是倒序排列）
  if (currentIndex + 1 < sortedArticles.length) {
    const previousArticle = sortedArticles[currentIndex + 1] as any;
    recommendations.previous = {
      title: previousArticle.data.title,
      slug: previousArticle.slug,
      description: previousArticle.data.description,
      date: previousArticle.data.date,
      category: currentCategory,
      tags: previousArticle.data.tags,
      image: previousArticle.data.image,
    };
  }

  // 獲取下一篇（索引 - 1，因為是倒序排列）
  if (currentIndex - 1 >= 0) {
    const nextArticle = sortedArticles[currentIndex - 1] as any;
    recommendations.next = {
      title: nextArticle.data.title,
      slug: nextArticle.slug,
      description: nextArticle.data.description,
      date: nextArticle.data.date,
      category: currentCategory,
      tags: nextArticle.data.tags,
      image: nextArticle.data.image,
    };
  }

  return recommendations;
}

/**
 * 生成文章 URL
 * @param article 文章對象
 * @returns 文章 URL
 */
export function generateArticleUrl(article: ArticleRecommendation): string {
  if (!article.category) {
    return `/${article.slug}`;
  }

  // 從 slug 中提取實際的 slug（去掉分類前綴）
  const pathParts = article.slug.split("/");
  const actualSlug = pathParts[pathParts.length - 1];

  return `/notes/${article.category}/${actualSlug}`;
}

/**
 * 格式化日期為可讀字符串
 * @param date 日期對象
 * @returns 格式化的日期字符串
 */
export function formatArticleDate(date: Date): string {
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
