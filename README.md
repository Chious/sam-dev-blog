# Sam's 開發博客 🚀

基於 Astro 構建的現代化開發博客，專注於技術分享和知識筆記。

## ✨ 特色功能

- 📝 **博客系統**: 支援 Markdown/MDX，語法高亮
- 📚 **技術筆記**: 分類整理的學習筆記
- 🎨 **響應式設計**: 基於 TailwindCSS 的現代化 UI
- 📊 **Mermaid 圖表**: 支援流程圖、時序圖等
- 🐳 **Docker 支援**: 容器化部署，開發/生產環境一致
- ⚡ **高性能**: 靜態生成，優化的載入速度

## 🛠️ 技術棧

### 核心框架

- **Astro 5.x** - 現代化靜態網站生成器
- **TypeScript** - 類型安全的開發體驗

### 樣式與設計

- **TailwindCSS 4.x** - 實用優先的 CSS 框架
- **響應式設計** - 適配各種裝置

### 內容管理

- **Markdown/MDX** - 內容創作與管理
- **Mermaid** - 圖表與流程圖支援
- **Playwright** - 用於 Mermaid 圖表渲染

### 開發與部署

- **Docker** - 容器化部署
- **Nginx** - 高性能靜態文件服務
- **Node.js 22** - 開發環境

## 📁 專案結構

```text
sam-dev-blog/
├── public/                 # 靜態資源
│   ├── images/            # 圖片資源
│   └── img/               # 博客圖片
├── src/
│   ├── components/        # Astro 組件
│   ├── content/           # 內容管理
│   │   ├── blog/         # 博客文章
│   │   └── notes/        # 技術筆記
│   ├── data/             # 資料定義
│   ├── layouts/          # 頁面佈局
│   ├── pages/            # 路由頁面
│   └── styles/           # 樣式文件
├── tasks/                # Task Master 任務管理
├── scripts/              # 專案腳本
├── Dockerfile            # Docker 構建文件
├── docker-compose.yml    # 容器編排
├── nginx.conf           # Nginx 配置
└── DOCKER.md            # Docker 使用指南
```

## 🚀 快速開始

### 方式 1：使用 Docker (推薦)

#### 生產環境部署

```bash
# 構建並啟動生產環境
docker-compose up -d

# 訪問網站
open http://localhost
```

#### 開發環境 (如需要)

```bash
# 啟動開發環境 (支援熱重載)
docker-compose --profile dev up sam-blog-dev

# 訪問開發伺服器
open http://localhost:4321
```

### 方式 2：傳統開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 構建生產版本
npm run build

# 預覽構建結果
npm run preview
```

## 📋 完整命令參考

| 命令                                   | 說明                          |
| :------------------------------------- | :---------------------------- |
| **Docker 命令**                        |                               |
| `docker-compose up -d`                 | 啟動生產環境 (端口 80)        |
| `docker-compose --profile dev up`      | 啟動開發環境 (端口 4321)      |
| `docker-compose logs -f sam-blog-prod` | 查看生產環境日誌              |
| `docker-compose down`                  | 停止所有服務                  |
| **傳統命令**                           |                               |
| `npm install`                          | 安裝依賴                      |
| `npm run dev`                          | 開發伺服器 (`localhost:4321`) |
| `npm run build`                        | 構建生產版本到 `./dist/`      |
| `npm run preview`                      | 本地預覽構建結果              |
| `npm run astro ...`                    | 執行 Astro CLI 命令           |

## 🔧 開發配置

### 環境要求

- **Node.js**: 18+ 或 22+
- **Docker**: 支援容器化部署
- **作業系統**: macOS, Linux, Windows

### 重要文件

- `astro.config.mjs`: Astro 主要配置
- `tailwind.config.js`: TailwindCSS 配置
- `docker-compose.yml`: 容器編排配置
- `nginx.conf`: 生產環境 Web 伺服器配置

## 📚 相關文檔

- [Astro 官方文檔](https://docs.astro.build)
- [TailwindCSS 文檔](https://tailwindcss.com/docs)
- [Docker 使用指南](./DOCKER.md)
- [Mermaid 圖表語法](https://mermaid.js.org/syntax/flowchart.html)

## 🚀 部署

### Docker 生產部署

```bash
# 一鍵部署
docker-compose up -d

# 健康檢查
curl http://localhost/health
```

### 自定義部署

專案生成的靜態文件位於 `dist/` 目錄，可以部署到任何靜態網站託管服務：

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

---

**🛠️ 由 [Astro](https://astro.build) 驅動 | 🎨 設計精美 | 📱 響應式體驗**
