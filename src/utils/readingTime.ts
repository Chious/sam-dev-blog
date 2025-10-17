/**
 * 閱讀時數計算工具
 * 根據文章內容長度估算閱讀時間
 */

// 預設閱讀速度（每分鐘字數）
const DEFAULT_READING_SPEED = {
  zh: 500, // 中文閱讀速度：每分鐘 500 字
  en: 200, // 英文閱讀速度：每分鐘 200 字
};

/**
 * 檢測文本語言
 * @param text 要檢測的文本
 * @returns 語言代碼 ('zh' | 'en')
 */
function detectLanguage(text: string): "zh" | "en" {
  // 簡單的中文字符檢測
  const chineseRegex = /[\u4e00-\u9fff]/g;
  const chineseMatches = text.match(chineseRegex);
  const chineseCount = chineseMatches ? chineseMatches.length : 0;

  // 如果中文字符超過總字符的 30%，認為是中文
  const totalChars = text.length;
  const chineseRatio = chineseCount / totalChars;

  return chineseRatio > 0.3 ? "zh" : "en";
}

/**
 * 計算文本的閱讀時數
 * @param content 文章內容
 * @param customSpeed 自定義閱讀速度（可選）
 * @returns 閱讀時數（分鐘）
 */
export function calculateReadingTime(
  content: string,
  customSpeed?: { zh: number; en: number }
): number {
  if (!content || content.trim().length === 0) {
    return 1; // 最少 1 分鐘
  }

  const readingSpeed = customSpeed || DEFAULT_READING_SPEED;
  const language = detectLanguage(content);

  // 移除 Markdown 語法標記
  const cleanContent = content
    .replace(/#{1,6}\s+/g, "") // 移除標題標記
    .replace(/\*\*(.*?)\*\*/g, "$1") // 移除粗體標記
    .replace(/\*(.*?)\*/g, "$1") // 移除斜體標記
    .replace(/`(.*?)`/g, "$1") // 移除代碼標記
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 移除鏈接標記
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // 移除圖片標記
    .replace(/```[\s\S]*?```/g, "") // 移除代碼塊
    .replace(/---/g, "") // 移除分隔線
    .replace(/\n+/g, " ") // 將換行符替換為空格
    .trim();

  // 計算字符數
  const charCount = cleanContent.length;

  // 根據語言計算閱讀時間
  const readingTime = Math.ceil(charCount / readingSpeed[language]);

  // 最少 1 分鐘，最多 60 分鐘
  return Math.max(1, Math.min(readingTime, 60));
}

/**
 * 格式化閱讀時數為可讀字符串
 * @param minutes 分鐘數
 * @returns 格式化的閱讀時數字符串
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) {
    return "少於 1 分鐘";
  } else if (minutes === 1) {
    return "1 分鐘閱讀";
  } else if (minutes < 60) {
    return `${minutes} 分鐘閱讀`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} 小時閱讀`;
    } else {
      return `${hours} 小時 ${remainingMinutes} 分鐘閱讀`;
    }
  }
}

/**
 * 從文章內容計算並格式化閱讀時數
 * @param content 文章內容
 * @param customSpeed 自定義閱讀速度（可選）
 * @returns 格式化的閱讀時數字符串
 */
export function getReadingTimeString(
  content: string,
  customSpeed?: { zh: number; en: number }
): string {
  const minutes = calculateReadingTime(content, customSpeed);
  return formatReadingTime(minutes);
}
