---
slug: astro-blog
title: Astro 建置部落格
tags: [astro, blog]
---

## 動機

最近因為要幫公司的網站換新版，所以就開始研究了一下目前比較流行的 CMS 系統，並且找到了一些比較有名的 Headless CMS 系統，這篇文章就是來記錄一下我們的採坑過程。

<!--truncate -->

## 專案動機

```plaintext
- [] 好看的現代化 UI、同時讓 RD 保有『改得動』的空間
- [] 透過 `markdown` 撰寫文章，並支援 `mermaid`、`PlantUML` 繪製流程圖
```

基於最近寫文件、簡報的風格，都是透過 `markdown` 來記錄，同時透過 IDE 的 `mermaid`、`PlantUML` 等套件來快速預覽架構圖。但是鑑於過去的文章都是放在 Docusaurus 上，但是 UI 的美觀又不盡理想，因此打算花些時間重構個人網站。

### Docusaurus

> 過去也曾經使用過 Docusaurus 來撰寫文件，但是 UI 的美觀又不盡理想，因此打算花些時間重構個人網站。

### Next.js

> 過去也曾經使用過 Next.js 基於 `markdown` 撰寫文章，但是 Next.js 需要額外準備 `markdown` 的解析器、額外解析 `header` 標籤，同時需要安裝很多依賴，同時會碰到很多非預期的 Hydration 問題，對於需求來說感覺還是『太重了』。

例如[官方文件](https://nextjs.org/docs/app/guides/mdx)提到：

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
```

## Relume.io

## 什麼是 Hydration？

## Astro vs Next.js
