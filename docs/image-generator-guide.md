# 圖片自動生成功能說明

## 功能概述

這個 Astro 專案現在支援自動為沒有配置圖片的文章生成相關圖片。系統會根據文章的標題和描述，自動從 Unsplash 獲取相關的圖片。

## 配置步驟

### 1. 申請 Unsplash API Key

1. 前往 [Unsplash Developers](https://unsplash.com/developers)
2. 註冊並創建一個新的應用
3. 獲取你的 Access Key

### 2. 配置環境變數

在專案根目錄創建 `.env` 文件：

```bash
# Unsplash API Configuration
UNSPLASH_ACCESS_KEY=你的_UNSPLASH_ACCESS_KEY
```

### 3. 重啟開發服務器

```bash
npm run dev
```

## 功能特點

### 智能關鍵字提取

- 系統會根據文章標題和描述自動提取相關關鍵字
- 支援中英文混合內容
- 內建技術、旅行、學習等領域的關鍵字映射

### 多層級 Fallback 機制

1. **優先使用現有圖片**：如果文章已經配置了圖片，直接使用
2. **Unsplash 搜索**：根據提取的關鍵字搜索相關圖片
3. **通用關鍵字搜索**：如果第一次搜索失敗，使用更通用的關鍵字
4. **預設圖片**：最後使用預設圖片確保頁面正常顯示

### 文章類型支援

- **Blog 文章**：使用技術相關的預設圖片
- **筆記 (Notes)**：使用學習相關的預設圖片
- **旅行 (Travel)**：使用旅行相關的預設圖片

## 使用方式

### 在 Layout 中使用

```typescript
import { generateArticleImage } from "@utils/imageGenerator";

// 生成文章圖片
const articleImage = await generateArticleImage(
  frontmatter.title,
  frontmatter.description,
  "blog", // 文章類型
  frontmatter.image // 現有圖片（可選）
);
```

### 同步版本（使用預設圖片）

```typescript
import { generateArticleImageSync } from "@utils/imageGenerator";

// 生成文章圖片（同步版本）
const articleImage = generateArticleImageSync(
  frontmatter.title,
  frontmatter.description,
  "blog",
  frontmatter.image
);
```

## 預設圖片

如果沒有配置 Unsplash API Key 或搜索失敗，系統會使用以下預設圖片：

- **Blog**: 技術相關圖片
- **Notes**: 學習相關圖片
- **Travel**: 旅行相關圖片
- **Fallback**: 通用圖片

## 注意事項

1. **API 限制**：Unsplash API 有使用限制，請合理使用
2. **網路依賴**：圖片生成需要網路連接
3. **性能考量**：建議在生產環境中考慮快取機制
4. **版權聲明**：使用 Unsplash 圖片時請遵守相關版權規定

## 故障排除

### 常見問題

1. **圖片不顯示**

   - 檢查 `UNSPLASH_ACCESS_KEY` 是否正確配置
   - 確認網路連接正常
   - 查看瀏覽器控制台是否有錯誤訊息

2. **API 錯誤**

   - 確認 API Key 有效
   - 檢查 API 使用量是否超限
   - 查看終端機的錯誤訊息

3. **圖片載入慢**
   - 這是正常現象，Unsplash 圖片需要時間載入
   - 考慮在生產環境中實作圖片快取

## 自定義配置

### 添加新的關鍵字映射

在 `src/utils/imageGenerator.ts` 中的 `KEYWORD_MAPPING` 對象中添加新的映射：

```typescript
const KEYWORD_MAPPING: Record<string, string[]> = {
  "your-keyword": ["search", "terms", "here"],
  // ... 其他映射
};
```

### 修改預設圖片

在 `DEFAULT_IMAGES` 對象中修改預設圖片 URL：

```typescript
const DEFAULT_IMAGES = {
  blog: "你的預設圖片URL",
  notes: "你的預設圖片URL",
  travel: "你的預設圖片URL",
  fallback: "你的預設圖片URL",
};
```
