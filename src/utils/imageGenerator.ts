import { createApi } from "unsplash-js";

// Unsplash API 實例
const unsplash = createApi({
  accessKey: import.meta.env.UNSPLASH_ACCESS_KEY || "YOUR_UNSPLASH_ACCESS_KEY",
});

// 預設圖片配置
const DEFAULT_IMAGES = {
  blog: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  notes:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  travel:
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  fallback:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
};

// 關鍵字映射表，根據文章標題和描述生成搜索關鍵字
const KEYWORD_MAPPING: Record<string, string[]> = {
  // 技術相關
  vite: ["web development", "build tools", "javascript"],
  astro: ["web development", "static site", "javascript"],
  react: ["react", "javascript", "frontend"],
  aws: ["cloud computing", "amazon web services", "server"],
  docker: ["containerization", "devops", "deployment"],
  javascript: ["javascript", "programming", "web development"],
  typescript: ["typescript", "javascript", "programming"],
  css: ["css", "styling", "web design"],
  html: ["html", "web development", "markup"],
  node: ["nodejs", "javascript", "backend"],
  python: ["python", "programming", "backend"],
  git: ["version control", "git", "development"],
  api: ["api", "web development", "backend"],
  database: ["database", "data storage", "backend"],
  security: ["cybersecurity", "web security", "protection"],
  performance: ["web performance", "optimization", "speed"],
  testing: ["software testing", "quality assurance", "development"],
  deployment: ["deployment", "devops", "hosting"],
  mobile: ["mobile development", "app development", "ios android"],
  ui: ["user interface", "design", "ux"],
  ux: ["user experience", "design", "interface"],

  // 旅行相關
  travel: ["travel", "adventure", "exploration"],
  taiwan: ["taiwan", "travel", "asia"],
  cycling: ["cycling", "bicycle", "outdoor"],
  hiking: ["hiking", "mountain", "nature"],
  food: ["food", "cuisine", "restaurant"],
  culture: ["culture", "tradition", "heritage"],
  nature: ["nature", "landscape", "outdoor"],
  city: ["city", "urban", "architecture"],

  // 學習相關
  tutorial: ["learning", "education", "tutorial"],
  guide: ["guide", "how to", "instruction"],
  tips: ["tips", "advice", "best practices"],
  review: ["review", "analysis", "evaluation"],
  comparison: ["comparison", "vs", "analysis"],

  // 個人相關
  experience: ["personal experience", "story", "journey"],
  project: ["project", "development", "work"],
  career: ["career", "professional", "work"],
  life: ["lifestyle", "personal", "daily"],
};

/**
 * 從文章標題和描述中提取關鍵字
 */
function extractKeywords(title: string, description?: string): string[] {
  const text = `${title} ${description || ""}`.toLowerCase();
  const keywords: string[] = [];

  // 檢查關鍵字映射
  for (const [key, values] of Object.entries(KEYWORD_MAPPING)) {
    if (text.includes(key)) {
      keywords.push(...values);
    }
  }

  // 如果沒有找到匹配的關鍵字，使用標題中的主要詞彙
  if (keywords.length === 0) {
    const words = title
      .toLowerCase()
      .replace(/[【】\[\]()（）]/g, "") // 移除括號
      .replace(/[，。！？,\.!?]/g, "") // 移除標點符號
      .split(/\s+/)
      .filter((word) => word.length > 1)
      .slice(0, 3); // 取前3個詞

    keywords.push(...words);
  }

  return keywords.slice(0, 3); // 最多返回3個關鍵字
}

/**
 * 根據文章內容生成搜索查詢
 */
function generateSearchQuery(title: string, description?: string): string {
  const keywords = extractKeywords(title, description);
  return keywords.join(" ");
}

/**
 * 從 Unsplash 獲取圖片
 */
async function fetchImageFromUnsplash(query: string): Promise<string | null> {
  try {
    const result = await unsplash.search.getPhotos({
      query,
      page: 1,
      perPage: 1,
      orientation: "landscape",
      contentFilter: "high",
    });

    if (result.response && result.response.results.length > 0) {
      const photo = result.response.results[0];
      return photo.urls.regular;
    }

    return null;
  } catch (error) {
    console.warn(`Failed to fetch image for query: ${query}`, error);
    return null;
  }
}

/**
 * 根據文章類型獲取預設圖片
 */
function getDefaultImageByType(type?: string): string {
  switch (type) {
    case "blog":
      return DEFAULT_IMAGES.blog;
    case "notes":
      return DEFAULT_IMAGES.notes;
    case "travel":
      return DEFAULT_IMAGES.travel;
    default:
      return DEFAULT_IMAGES.fallback;
  }
}

/**
 * 主要函數：為文章生成圖片
 * @param title 文章標題
 * @param description 文章描述
 * @param type 文章類型 (blog, notes, travel)
 * @param existingImage 已存在的圖片 URL
 * @returns 圖片 URL
 */
export async function generateArticleImage(
  title: string,
  description?: string,
  type?: string,
  existingImage?: string
): Promise<string> {
  // 如果已經有圖片，直接返回
  if (existingImage) {
    return existingImage;
  }

  // 檢查是否有 Unsplash API Key
  if (
    !import.meta.env.UNSPLASH_ACCESS_KEY ||
    import.meta.env.UNSPLASH_ACCESS_KEY === "YOUR_UNSPLASH_ACCESS_KEY"
  ) {
    console.warn("Unsplash API key not configured, using default image");
    return getDefaultImageByType(type);
  }

  try {
    // 生成搜索查詢
    const searchQuery = generateSearchQuery(title, description);

    // 從 Unsplash 獲取圖片
    const imageUrl = await fetchImageFromUnsplash(searchQuery);

    if (imageUrl) {
      return imageUrl;
    }

    // 如果搜索失敗，嘗試使用更通用的關鍵字
    const fallbackQuery =
      extractKeywords(title, description)[0] || "technology";
    const fallbackImageUrl = await fetchImageFromUnsplash(fallbackQuery);

    if (fallbackImageUrl) {
      return fallbackImageUrl;
    }

    // 最後使用預設圖片
    return getDefaultImageByType(type);
  } catch (error) {
    console.error("Error generating article image:", error);
    return getDefaultImageByType(type);
  }
}

/**
 * 同步版本：為文章生成圖片（使用預設圖片）
 * @param title 文章標題
 * @param description 文章描述
 * @param type 文章類型
 * @param existingImage 已存在的圖片 URL
 * @returns 圖片 URL
 */
export function generateArticleImageSync(
  title: string,
  description?: string,
  type?: string,
  existingImage?: string
): string {
  // 如果已經有圖片，直接返回
  if (existingImage) {
    return existingImage;
  }

  // 返回預設圖片
  return getDefaultImageByType(type);
}
