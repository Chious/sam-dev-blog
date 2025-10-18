---
title: 【Vite 入門】從零開始的網頁效能優化與打包實戰
description: 為初學者設計的 Vite 入門筆記。從為何要做效能優化 (Web Vitals) 開始，循序漸進介紹 Vite 如何打包 JS, CSS 與靜態資源，最後再到如何打包可重用的模組。
date: 2025-10-17
image: https://images.unsplash.com/photo-1550063873-ab792950096b
---

> 這篇文章是基於 Frontend Masters 的 [Vite: A Workshop](https://frontendmasters.com/courses/vite/) 課程筆記，並根據個人理解重新編排與補充，目標是為初學者提供一份從「為什麼」到「怎麼做」的實戰指南。

## Part 1: 為什麼我們需要打包與效能優化？

> 先備知識：[Web Performance Fundamentals, v2](https://frontendmasters.com/courses/web-perf-v2/)

有時候我們打開 Web Tools，只是想看看網頁載入了哪些東西、跑個 Lighthouse 分數，但這背後其實藏著大學問：**使用者體驗**。

一個「感覺很快」的網站，不僅能留住使用者，也是 Google 搜尋排名的重要因素。而要達到「快」，我們就必須了解 **Web Vitals**。

### 什麼是 Web Vitals？

Web Vitals 是 Google 提出的一組指標，用來衡量網站的健康程度。其中最重要的三個核心指標（Core Web Vitals）是：

- **LCP (Largest Contentful Paint)**：**載入效能**。從使用者點擊連結開始，到畫面上「最大」的圖片或文字區塊被完整顯示出來所需的時間。這個時間應低於 **2.5 秒**。
- **FID (First Input Delay) / INP (Interaction to Next Paint)**：**互動性**。使用者第一次與頁面互動（例如點擊按鈕）到瀏覽器真正做出反應的時間。這個時間應低於 **100 毫秒**。
- **CLS (Cumulative Layout Shift)**：**視覺穩定性**。測量頁面在載入過程中，非預期的版面位移程度。例如，你看文章看到一半，突然跳出一個廣告把版面往下推，這就是不好的 CLS。

### 如何快速載入畫面？

要改善 Web Vitals，關鍵在於「**只在需要時，載入需要的東西**」。這就是打包工具如 Vite 發揮作用的地方。透過 **Code Splitting (程式碼分割)**，我們可以將巨大的 JavaScript 檔案拆分成許多小塊，只在使用者需要時才去下載它們。

最經典的技巧就是 **Dynamic Import (動態載入)**。

> **💡 學習建議：動手做實驗**
>
> 在開始深入 Vite 的功能前，有個很棒的學習方法：建立一個不依賴任何框架的 vanilla JS 專案。
>
> 這次 workshop 最大的收穫就是：學習時不要一次處理太複雜的架構。你可以先從一個簡單的 `index.html` 和 `main.js` 開始，接著：
>
> 1.  寫一點 JavaScript，執行 `npm run build`，看看 `dist` 資料夾裡產生了什麼。
> 2.  接著，在 JS 中 `import` 一個 CSS 檔案，再 `npm run build` 一次，觀察變化。
> 3.  最後，再試著引入一張圖片，看看結果有何不同。
>
> 透過這樣不斷修改語法、觀察打包結果的過程，你會對 Vite 如何處理各種資源有非常直觀的理解。例如，你會在終端機看到類似這樣的報告：
>
> ```sh
> vite v4.5.0 building for production...
> ✓ 5 modules transformed.
> dist/index.html                  1.11 kB │ gzip: 0.50 kB
> dist/assets/counter-d1e8c484.js  0.38 kB │ gzip: 0.22 kB
> dist/assets/index-46daa88e.js    1.71 kB │ gzip: 0.90 kB
> ```
>
> 這個過程能幫助你專注於 Vite 本身，而不是被 React 或其他框架的複雜性分心。

## Part 2: Vite 核心打包功能

Vite 是一個現代化的前端打包工具，它能幫助我們輕鬆實踐效能優化。它的核心理念是：在開發時提供極速的反應，在打包時產出最優化的檔案。

### 一、打包 JavaScript

**需求**：我的頁面有一個點擊按鈕後才會出現的計數器。在使用者點擊前，我不想浪費網路流量去載入計數器的程式碼。

**解法**：使用 Dynamic Import。

- **原生 JS 寫法**

  ```js
  // main.js
  const button = document.querySelector("button");

  button.addEventListener("click", () => {
    // 直到點擊後，才去下載 counter.js
    import("./counter.js").then(({ initializeCounter }) => {
      initializeCounter();
    });
  });
  ```

  打包後，你會發現 `counter.js` 被獨立成一個小檔案，實現了按需載入。

- **React 寫法**

  在 React 中，我們可以使用 `React.lazy` 和 `Suspense` 來實現一樣的效果，這也是 Dynamic Import 的一種應用。

  **需求**：頁面中有一個很肥大的圖表元件，我希望它在主要內容顯示後再慢慢載入。

  ```jsx
  import { lazy, Suspense } from "react";

  // 使用 lazy 動態引入圖表元件
  const HeavyChart = lazy(() => import("@/components/heavy-chart"));

  function MyPage() {
    return (
      <div>
        <h1>我的頁面</h1>
        {/* 在圖表載入完成前，顯示一個骨架屏 */}
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      </div>
    );
  }
  ```

### 二、打包 CSS

現代 CSS 開發面臨著全域作用域、語法限制等挑戰。Vite 對此提供了全方位的支援，主要體現在以下三個方面：

#### 1. 解決樣式污染：CSS Modules

**需求**：我希望元件的樣式是獨立的，不會跟其他元件或全域樣式互相「污染」。

**解法**：使用 CSS Modules。只要將 CSS 檔案命名為 `*.module.css`，Vite 就會自動啟用此功能。

```css
/* form.module.css */
.form_title {
  font-size: 24px;
  color: blue;
}
```

```jsx
// MyForm.jsx
import styles from "./form.module.css";

function MyForm() {
  return <h2 className={styles.form_title}>這是一個表單標題</h2>;
}
```

打包後，`form_title` 會被加上一組獨一無二的 hash 值，例如 `form_title_aB1x2`，從而保證了樣式的唯一性。

#### 2. 增強語法能力：Sass/Less 預處理器

**需求**：我厭倦了重複寫選擇器，希望能像寫程式一樣使用巢狀和變數。

**解法**：使用 Sass。只需安裝對應的預處理器，Vite 就能直接使用。

```sh
npm install -D sass
```

然後你就可以在專案中直接引入 `.scss` 檔案，並使用其強大的語法。

```scss
// button.scss
$primary-color: #3498db;

.button {
  color: $primary-color;
  padding: 10px 20px;

  &:hover {
    background-color: darken($primary-color, 10%);
  }
}
```

#### 3. 自動化與未來語法：PostCSS

**需求**：我希望我的 CSS 能自動加上瀏覽器前綴以相容舊版瀏覽器，並且想嘗試一些還在草案階段的 CSS 新功能。

**解法**：使用 PostCSS。你可以把它想像成 CSS 界的 Babel，透過插件來轉換你的 CSS。

Vite 內建 PostCSS 支援。你只需要安裝你想要的插件，並建立一個 `postcss.config.js` 檔案。

```js
// postcss.config.js
module.exports = {
  plugins: {
    autoprefixer: {}, // 自動加上 -webkit-, -moz- 等前綴
    "postcss-nesting": {}, // 讓你可以在標準 CSS 中使用巢狀語法
  },
};
```

有了這個設定，即使你寫的是標準 CSS，也能享受到 PostCSS 插件帶來的便利，Vite 會在打包時自動幫你處理好一切。

### 三、處理靜態資源 (Assets)

**需求**：我想在網頁上顯示一張圖片，並希望它能被優化，例如自動轉換成 WebP 格式，並根據螢幕大小提供不同尺寸。

**解法**：使用 `vite-imagetools` 插件和特殊的圖片引入語法。

```sh
npm install -D vite-imagetools
```

```js
// vite.config.js
import { defineConfig } from "vite";
import imageTools from "vite-imagetools";

export default defineConfig({
  plugins: [imageTools()],
});
```

```js
// 透過在 import 路徑後加上查詢參數，告訴 Vite 如何處理這張圖
import imageSrcset from "./my-image.jpg?w=400;800;1200&format=webp&as=srcset";
import imageFallback from "./my-image.jpg?w=800&format=webp";

const img = document.createElement("img");
img.srcset = imageSrcset; // 提供給瀏覽器選擇的 WebP 圖片集
img.src = imageFallback; // 預設圖片
img.loading = "lazy"; // 圖片懶載入
document.body.appendChild(img);
```

**需求**：我有一個資料夾裡放了數十個 SVG 圖標，我想一次全部載入它們。

**解法**：使用 Vite 內建的 `import.meta.glob` 功能。

```js
// 這會找到所有在 ./logos/ 目錄下的 .svg 檔案
const modules = import.meta.glob("./logos/**/*.svg");

// 迴圈載入並使用它們
for (const path in modules) {
  modules[path]().then((module) => {
    console.log(`Loaded ${path}:`, module);
  });
}
```

## Part 3: 模組化打包 (Library Mode)

當我們想將一些共用元件（如 Design System）打包成一個獨立的函式庫供其他專案使用時，就需要進入 Vite 的「函式庫模式」。

### 1. 共用 UI 元件庫

**需求**：我寫好了一個 React 按鈕元件，想把它打包成一個 npm 套件，讓其他同事可以安裝使用。

**解法**：在 `vite.config.ts` 中設定 `build.lib` 和 `build.rollupOptions`。

- **元件程式碼** (`src/Button.tsx`)

  ```tsx
  import React from "react";
  import "./button.css"; // 元件自己的樣式

  export const Button = ({ children }) => {
    return <button className="my-button">{children}</button>;
  };
  ```

- **打包設定** (`vite.config.ts`)

  ```ts
  import { resolve } from "path";
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";

  export default defineConfig({
    plugins: [react()],
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"), // 函式庫的進入點
        name: "MyAwesomeLib", // UMD 模式下的全域變數名稱
        fileName: "my-awesome-lib", // 輸出的檔案名稱
      },
      rollupOptions: {
        // 告訴 Vite/Rollup，react 這個依賴是外部的，不要把它打包進來
        external: ["react", "react-dom"],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
        },
      },
    },
  });
  ```

這樣打包後，你的 `dist` 資料夾裡就會有 `my-awesome-lib.js` 和 `my-awesome-lib.umd.js` 等檔案，可以發布到 npm 或是本地的儲存庫。其他專案安裝後，就可以 `import { Button } from 'my-awesome-lib'` 來使用。

- 使用 Library Mode 的專案

```sh
npm install my-awesome-lib  // npm 安裝
npm link ../my-awesome-lib  // 本地開發時使用
```

```js
// /my-company-repo/offical-website/src/pages/index.tsx
import { Button } from "my-awesome-lib";

export default function HomePage() {
  return (
    <div>
      <h1>My Official Website</h1>
      <Button>Click Me</Button>
    </div>
  );
}
```

### 2. 微前端應用

**需求**：Module Federation -- 一個專案中有多個微前端應用，我希望如`<header/>` 樣式的版本更新時，能夠不必重新 `npm run build`，而是能夠動態載入更新後的版本。

**解法**：使用 Vite 搭配 Module Federation 插件，例如 `@originjs/vite-plugin-federation`。

Module Federation (模組聯盟) 是一種先進的架構，它允許一個 JavaScript 應用在**執行時**，動態地從另一個**獨立部署**的應用中載入程式碼。這在微前端架構中非常有用。

想像一下，你的網站由多個團隊維護：

- **主應用 (Host)**：網站的整體框架。
- **標頭應用 (Remote)**：專門負責網站的 `<header/>`。

當「標頭應用」的團隊更新了 header 的樣式並部署後，「主應用」**不需要重新打包部署**。使用者下次刷新頁面時，主應用會自動去拉取最新版本的 header 來顯示。這就是 Module Federation 的魔力。

1.  **安裝插件**

    ```sh
    npm install -D @originjs/vite-plugin-federation
    ```

2.  **設定 Remote (提供元件的應用)**

    ```js
    // header-app/vite.config.js
    import federation from "@originjs/vite-plugin-federation";

    export default defineConfig({
      plugins: [
        federation({
          name: "headerApp", // 應用名稱
          filename: "remoteEntry.js", // 入口檔案
          exposes: {
            // 暴露出去的元件
            "./Header": "./src/Header.tsx",
          },
          shared: ["react", "react-dom"], // 共用的依賴
        }),
      ],
    });
    ```

3.  **設定 Host (使用元件的應用)**

    ```js
    // main-app/vite.config.js
    import federation from "@originjs/vite-plugin-federation";

    export default defineConfig({
      plugins: [
        federation({
          name: "mainApp",
          remotes: {
            // 從遠端載入的應用
            headerApp: "http://localhost:5001/assets/remoteEntry.js",
          },
          shared: ["react", "react-dom"],
        }),
      ],
    });
    ```

4.  **在 Host 中使用**

    ```jsx
    // main-app/src/App.tsx
    import React from "react";

    // 從遠端應用動態載入 Header 元件
    const Header = React.lazy(() => import("headerApp/Header"));

    function App() {
      return (
        <div>
          <React.Suspense fallback="Loading Header...">
            <Header />
          </React.Suspense>
          <h1>主應用的內容</h1>
        </div>
      );
    }
    ```

## 參考資料

- [【Frontend Masters】Vite: A Workshop -- Course Notes](https://vite-workshop.vercel.app/introduction)
- [web.dev by Google - Web Vitals](https://web.dev/vitals/)
