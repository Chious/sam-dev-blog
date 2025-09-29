# Cloudflare Pages 部署指南

## 🎯 專案概覽

本專案已完成以下 Cloudflare 設定：
- ✅ 域名 `sam-dev.space` 已轉移到 Cloudflare 管理
- ✅ Cloudflare Pages 專案 `sam-dev-blog` 已創建
- ✅ R2 存儲桶 `sam-dev-blog` 已設定，綁定子域名 `files.sam-dev.space`
- ✅ GitHub Actions 自動部署已配置
- ✅ 解決了 25MB 文件大小限制問題

## 🏗️ 架構說明

### 域名配置
- **主網站**: `https://sam-dev.space` → Cloudflare Pages (Astro 靜態網站)
- **文件 CDN**: `https://files.sam-dev.space` → Cloudflare R2 (大文件存儲)

### 文件處理策略
- **小文件** (< 25MB): 直接包含在 Astro 構建中
- **大文件** (≥ 25MB): 存儲在 R2，通過自定義域名訪問

## 🚀 部署方式

### 方式 1: GitHub Actions 自動部署 (目前使用)

**工作流程**：
1. 推送代碼到 `main` 分支
2. GitHub Actions 自動觸發
3. 在 Ubuntu 環境中安裝依賴 (包括 Playwright + Chromium)
4. 執行 `npm run build` 生成靜態文件
5. 部署到 Cloudflare Pages

**已配置的 GitHub Secrets**：
- `CLOUDFLARE_API_TOKEN`: API Token (具有 Pages:Edit 和 R2:Edit 權限)
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID

### 方式 2: 本地 Wrangler CLI 部署

```bash
# 安裝 Wrangler (如果尚未安裝)
npm install -g wrangler

# 登入 Cloudflare
wrangler login

# 本地構建並部署
npm run deploy
```

## 📁 R2 大文件管理

### R2 存儲桶配置
- **存儲桶名稱**: `sam-dev-blog`
- **自定義域名**: `files.sam-dev.space`
- **用途**: 存放超過 25MB 的文件 (如 PDF 文檔)

### R2 操作命令
```bash
# 上傳文件到 R2
wrangler r2 object put sam-dev-blog/bike-cycling-guide.pdf --file=public/pdf/bike-cycling-guide.pdf --remote

# 檢查文件是否存在
wrangler r2 object get sam-dev-blog/bike-cycling-guide.pdf --file=test-download.pdf --remote

# 列出存儲桶
wrangler r2 bucket list

# 檢查域名綁定狀態
wrangler r2 bucket domain list sam-dev-blog
```

### 在 Markdown 中使用 R2 文件
```yaml
# 在 frontmatter 中引用 R2 文件
pdfUrl: 'https://files.sam-dev.space/bike-cycling-guide.pdf'
hasPdf: true
```

## ⚙️ 配置文件說明

### wrangler.toml
```toml
name = "sam-dev-blog"
compatibility_date = "2024-09-29"
pages_build_output_dir = "dist"

[env.production]
name = "sam-dev-blog"
SITE_URL = "https://sam-dev.space"
```

### GitHub Actions (.github/workflows/deploy.yml)
- 自動安裝系統依賴 (wget, gnupg)
- 智能快取 Playwright 瀏覽器 (避免重複下載)
- 安裝 Playwright 和 Chromium (用於 rehype-mermaid)
- 完整構建靜態文件後部署到 Cloudflare Pages

## 🔑 API Token 權限設定

### 必要權限
```
Account | Cloudflare Pages:Edit
Account | R2:Edit
Zone | Zone:Read
Zone | DNS:Edit
```

### 獲取 API Token
1. 前往 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 點擊 "Create Token"
3. 使用 "Cloudflare Pages:Edit" 模板或自定義權限
4. 設定 Account 和 Zone 資源範圍

## 自定義域名設置

1. 在 Cloudflare Pages 專案中點擊 "Custom domains"
2. 添加你的域名 `sam-dev.space`
3. 按照指示更新 DNS 記錄

## 🔧 構建配置

- **Framework**: Astro (靜態)
- **Node.js 版本**: 20
- **構建命令**: `npm run build`
- **輸出目錄**: `dist`
- **根目錄**: `/` (專案根目錄)

## 📝 重要配置說明

### Astro 配置 (astro.config.mjs)
- `output: 'static'` - 靜態網站輸出
- 移除了 Vercel 適配器 - 靜態部署不需要適配器
- 保留 `rehype-mermaid` 支援

### 特殊依賴處理
- **rehype-mermaid**: 需要 Playwright + Chromium 渲染 Mermaid 圖表
- **GitHub Actions**: 在構建環境中自動安裝所有依賴
- **Cloudflare Pages**: 只接收已構建好的靜態文件

## 🧪 本地測試

```bash
# 構建專案
npm run build

# 預覽構建結果
npm run preview

# 本地部署測試
npm run deploy
```

## 🚨 故障排除

### 常見問題
- **25MB 文件限制**: 大文件已移至 R2 存儲桶
- **DNS 未生效**: `files.sam-dev.space` 可能需要時間傳播
- **構建失敗**: 檢查 Node.js 版本是否為 20
- **Playwright 錯誤**: GitHub Actions 會自動處理依賴安裝

### 檢查清單
- ✅ GitHub Secrets 已設定
- ✅ R2 文件已上傳
- ✅ DNS 記錄已配置
- ✅ 本地大文件已移除

## 📊 部署狀態

**目前狀態**: 
- 主網站: `sam-dev.space` (Cloudflare Pages)
- 文件 CDN: `files.sam-dev.space` (Cloudflare R2)
- 自動部署: GitHub Actions
- 大文件處理: 已解決 25MB 限制
