---
title: "【Astro】環境建置與基本使用"
date: 2025-07-01
---

# 【Astro】環境建置與基本使用

## 架構

### 1. Routing 路徑介紹

> Astro 路徑與 Next.js 一樣，是基於 file based routing，因此可以很方便的進行路徑管理。

```plaintext
|
|-components
|-content
|-layouts
|-pages
|-public
|-src
|-.astro
|-.env
|-.env.local
|-.env.development.local
```

- `404.astro`: 404 頁面
- `index.astro`: 首頁
- `about.astro`: 關於頁面
- `contact.astro`: 聯絡頁面
- `posts/[slug].astro`: 文章頁面
- `posts/[slug]/index.astro`: 文章頁面
- `posts/[slug]/index.astro`: 文章頁面
