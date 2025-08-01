---
title: 【週間札記】用 Astro 更新部落格！
description: 個人部落格更新日誌
date: 2025-08-01
---

## 前言

成為工程師後，我發現這份工作更像是在寫文章，特別是在 AI 崛起之後，花更多時間理解需求，並將抽象概念轉化為 PRD 及實際產品。

- 初期需求討論：

  - 「我們最近要推 OOO 產品，但希望同一份程式碼支援網頁與 App，能幫忙規劃嗎？」
  - 「那使用情境是什麼？需要支援 XXX 嗎？目前我知道至少有兩種方式：WebView 與 JVM...（解釋中）」
  - 「根據上次會議，我整理了幾個解法與優先順序，確認一下執行方式是否可行。」
  - 將研究與結論轉換為架構圖與簡報說明。

- Debug / Ticket 回報：

  - 「客戶反映下拉選單在某些情境下會消失（附重現步驟）」
  - 「Bug 修復完成，調整了 XXX，驗證方式是 OOO。」
  - 如果是 GitHub Issue 的回報，可以參考 [New Suspense SSR Architecture in React 18](https://github.com/reactwg/react-18/discussions/37)。

- 讀書會：https://chious.github.io/fp-intro-ch16-17/1

![Slidev Picture Here](/img/notes/slidev-fp-ch16-ch17.png)

- 「Event Loop 是在 JS 執行環境外處理異步問題的核心概念...（說明中）」
- 通常會搭配 Cursor 快速建立簡報、流程圖或程式碼。

因此日常如何整理筆記也成為了一個硬需求，最近終於有時間重構自己的部落格，並搬遷 Docusaurus 上的舊文，同時符合日常的筆記習慣。

## 過去經驗回顧

內容管理系統常出現在各種專案中，根據角色、資源與客戶需求動態調整策略，也逐漸歸納出不同開發方式：

### 1. 手刻 React 後台

- 專案中途接手現有程式碼。
- 因為缺乏現成模組，且畫面邏輯特殊，只能用 React 自行實作會員管理、文章上傳等功能。
- 缺點明顯：花費大量時間在 API 串接、畫面開發與除錯。

### 2. Docusaurus：用於開發文件

> 從大學起就習慣用 Obsidian、HackMD 做筆記，因此嘗試用 Docusaurus 管理開放文件。

![Docusaurus Admin Picture Here](/img/notes/docusaurus.png)

- 文章未涉機密，可直接用 GitHub 儲存並同步 Medium，同時不需要負擔租 Server 的費用。
- 基於 React，路徑與搜尋功能已有內建，只需少量修改。
- 缺點：
  - 非技術人員不熟 Markdown，需要即看即所得（What You See Is What You Get）編輯器輔助。
  - 支援的 Decap CMS（前身 Netlify CMS）缺乏維護。
  - 客製化程度有限。

### 3. Headless CMS

> 無設計稿、後端工程師的情況下，研究 PayloadCMS、Strapi 等開源可客製的框架。

![Strapi Admin Picture Here](https://delicate-dawn-ac25646e6d.media.strapiapp.com/Content_Management_cfd037fcc2.png)

- 有些設計師偏好 Webflow，且能整合 AI 工具如 Relume。
- 後端（Strapi）：
  - 適合自媒體，支援 API 客製、Image Bucket、i18n、多語言與郵件通知寄送（SMTP）。
- 前端（Next.js）：
  - 實現動態效果、JS 事件綁定、快取、路由設計與串接後台。
- 缺點：
  - 若前端文章用 MDX 儲存，需額外套件，增加複雜度。

## 開發過程

> 根據 [State of Frontend 2024](https://tsh.io/state-of-frontend)，約 20% 開發者使用 Astro 作為靜態網站框架。相較之下，Next.js 的 SSR 邏輯越來越不直覺，因此這次改用 Astro。

![State of Frontend 2024](/img/notes/state-of-frontend-2024.png)

### 功能性需求

- 支援 Markdown 的部落格頁面轉換
  - 可解析 PlantUML、Mermaid 圖
  - 使用 [Tailwind CSS Typography](https://github.com/tailwindlabs/tailwindcss-typography) 美化文章樣式
  - 程式碼區塊具備 Copy 按鈕
- 全站搜尋功能
  - 可讀取本地 Markdown 檔案
  - 提供 `GET /api/article-list` API 回傳所有文章資訊

### 非功能性需求

- 國際化（i18n）
  - 中文文章自動翻譯為英文
  - 英文文章需對應搜尋結果與路徑

### 初期設計流程

#### 1. 前端設計稿難以從零產出

> 很多前端 RD 其實讀太擅長從需求文字直接想到很細節的 RWD ，因此這次藉由 Relume.io 生成初始版面。

- 使用 Relume.io 生成初始版面（如果需要可以參考我的[分享碼](https://www.relume.io?utm_source=referral&referralCode=4d53df9)）
- 雖不支援直接輸出 React 元件，但可將 HTML 匯入 `.astro` 檔案

```astro
<!-- SSR Javascript 放在這 -->
---
// Your component script here!
import Banner from '../components/Banner.astro';
import Avatar from '../components/Avatar.astro';
import ReactPokemonComponent from '../components/ReactPokemonComponent.jsx';
const myFavoritePokemon = [/* ... */];
const { title } = Astro.props;
---
<!-- HTML comments supported! -->
{/* JS comment syntax is also valid! */}

<Banner />
<h1>Hello, world!</h1>

<!-- Use props and other variables from the component script: -->
<p>{title}</p>

<!-- Delay component rendering and provide fallback loading content: -->
<Avatar server:defer>
  <svg slot="fallback" class="generic-avatar" transition:name="avatar">...</svg>
</Avatar>

<!-- Include other UI framework components with a `client:` directive to hydrate: -->
<ReactPokemonComponent client:visible />

<!-- Mix HTML with JavaScript expressions, similar to JSX: -->
<ul>
  {myFavoritePokemon.map((data) => <li>{data.name}</li>)}
</ul>

<!-- Use a template directive to build class names from multiple strings or even objects! -->
<p class:list={["add", "dynamic", { classNames: true }]} />
```

#### 2. 實作文章內頁：Markdown 與靜態網頁轉換

> 接著需解決路由與 Markdown 靜態轉換問題：

- 熟悉 Astro 的 `getCollection()`、Layout、File System 特性
- Astro 對 Markdown 支援良好，無需額外套件

```plaintext
src
|- content （文章管理）
  |- blog
    |- 2025-08-01-astro-blog-update-log.md
    |- 2025-07-31-astro-blog-update-log.md
  |- config.ts （文章類型管理）
|- layouts （共用 layout）
  |- Layout.astro
|- pages （路由）
  |- blog
    |- [slug].astro
  |- index.astro
  |- 404.astro
```

```typescript
// @/content/config.ts
import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    description: z.string(),
    date: z.string(),
  }),
});

export const collections = {
  blog: blogCollection,
};
```

#### 3. 實作搜尋功能

- 不像 Next.js 提供 `<Link/>`、`<Image/>` 等元件：
  - Astro 需要使用 `<a/>` 並視需求客製化屬性，如 `href`、`target`、`rel` 等。

```astro
<a href="/blog/astro-blog-update-log" class="text-blue-500">
  <h1>Astro Blog Update Log</h1>
</a>
```

當初始版型完成後，下一步為實作搜尋與 SEO：

- Astro 支援 `sitemap()`，與 Next.js 類似，可設定 `og:image` 等於 Layout 層。

```astro
---
const { seo = {} } = Astro.props;
// Astro 可以從 markdown 檔案或是客製化 props 取得 SEO 參數
// 然後需要客製化 props 參數處理
---
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{seo.title}</title>
    <meta name="description" content={seo.description} />
    <meta property="og:image" content={seo.image} />
  </head>
  <main>
    <slot /> <!-- 文章內容及 Child Component 會放在這-->
  </main>
  <footer>
</body>
</html>
```

- 搜尋功能參考 [這篇文章](https://www.webdong.dev/zh-tw/post/astro-search-functionality/)，使用 Fuse.js 與 [PreactJS](https://preactjs.com)

```typescript
// @/pages/api/search.json.ts
import { getCollection } from "astro:content";
import type { UnifiedArticle } from "@/data/mockArticles";

async function getAllArticles(): Promise<UnifiedArticle[]> {
  const [blogPosts, notes, travelPosts] = await Promise.all([
    getCollection("blog"),
  ]);

  return [
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
  ];
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
```

接著前端可以呼叫這個端點來取得所有文章資訊：

```plaintext
fetch("http://localhost:4321/api/search.json")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  });
```

## Astro 開發心得

### 1. HMR 更新快速

> Astro 預設大多數內容為靜態 HTML，僅在必要時使用 `client:load` 或自訂的客戶端渲染。

```plaintext
astro  v5.10.1 ready in 1034 ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose


12:49:14 watching for file changes...
12:49:17 [200] / 121ms
12:49:18 [200] /api/search.json 3ms
12:49:19 [200] /blog 9ms
12:49:19 [200] /api/search.json 2ms
12:49:21 [200] /blog/astro-blog-update-log 6ms
12:49:21 [404] /img/notes/astro-accessibility-feedback.png 4ms
```

### 2. 僅在必要時使用框架

> 曾在面試時聊到：「雖然熟悉 Next.js，但許多功能（如圖片處理、路由、錯誤頁）都是框架幫你做好，真正挑戰是思考若沒有框架，該如何實作。我們真的需要這麼多框架嗎？」

- NextJS 的本質：在 Server 端呼叫 `React.createElement` 並渲染到 Client 端。

- Astro
  - 僅在必要的時候使用套件，大部分仍然依賴原生的 HTML 標籤、JS 語言。
  - 如果需要，可以整合如：Vue、React 等框架、及外部的擴充套件（如：sitemap、tailwindcss 等）。

### 3. 開發者體驗友善

- 相比 Next.js 偏向提示 Hydrate 問題，Astro 會直接指出標籤錯誤或漏填屬性。

![Accessbility Feedback](/img/notes/astro-accessibility-feedback.png)

## 小結

Astro 提供輕量、可擴充的架構，對於偏好靜態內容與漸進式加載的需求來說，如果未來有小型專案，仍然會考慮使用。

同時很多程式碼會看到 NextJS 及 React 的影子，過去的開發經驗可以無痛遷移。

---

## 參考資料

1. [Next.js — How to use markdown and MDX](https://nextjs.org/docs/app/guides/mdx)
2. [Webflow — Code Export 說明](https://help.webflow.com/hc/en-us/articles/33961386739347-Code-export#01JDAH4DZQCZRSP2NQS7BFJZWJ)
3. [Astro 搜尋功能實作教學](https://www.webdong.dev/zh-tw/post/astro-search-functionality/)
4. [State of Frontend 2024 調查](https://tsh.io/state-of-frontend)
5. [Tailwind CSS Typography Plugin](https://github.com/tailwindlabs/tailwindcss-typography)
6. [Preact 官方網站](https://preactjs.com)
