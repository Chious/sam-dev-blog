---
title: "動畫練習1：從基礎動畫到頁面轉場"
date: 2025-12-31
tags: ["animation", "gsap", "scroll-trigger"]
---

## 前言

回顧這一年來的開發歷程，真正讓我有「Aha! Moment」（頓悟時刻）的瞬間大概有兩個：一個是在學習新技術，或是真的解決產品問題時；另一個，則是成功寫出一個真正細膩、好看的畫面時。

通常，完成 Bootcamp 或是入門前端教材，要做出一個功能正常的後台管理介面並非難事，但在工作時遇到資深的前端前輩，
厲害的是就算沒有設計稿，也能憑空切出流暢的畫面。但要做到「視覺流暢」且具備質感，往往需要靠經驗跟練習。因此最近也在心想，真的接到非常『Aha!』 的專案前，不如就來模仿跟練習吧。

## 1. 基礎入門：CSS 動畫與卷動偵測

![](@/assets/audiophile-ecommerce.gif)

最輕量且效能最好的方式，莫過於使用原生的 CSS。若只需簡單的淡入淡出，我們可以定義 CSS Animation，並搭配 JavaScript 的 `IntersectionObserver` 去監控使用者的操作行為，來決定要不要觸發動畫效果。

**核心概念：**

1. CSS 定義關鍵影格 (`@keyframes`) 與轉場樣式。
2. JS 監聽元素位置，進入畫面時加上 class 觸發動畫。

```css
/* 定義動畫關鍵影格 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-section {
  opacity: 0;
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

/* 當 JS 加上此 class 時觸發效果 */
.fade-in-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

```javascript
/* IntersectionObserver：偵測使用者是否滾動到該區塊 */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // 元素進入畫面，加上 class 觸發 CSS transition
      entry.target.classList.add("is-visible");
      // 動畫觸發後即可停止觀察，節省效能
      observer.unobserve(entry.target);
    }
  });
});
```

## 2. 頁面滾動：GSAP ScrollTrigger

![](@/assets/this-is-taipei-1.gif)

當需要處理 3D 或複雜的時間軸動畫時，開發者就像工匠一樣，需要精準定義每一幀發生了什麼事。由於 `GSAP` 是開源的專案，同時套件已經幫你定義好動畫的函式，你只需要去定義哪時候、發生了什麼事，在處理一些較複雜的動畫效果時，會比較偏好使用。

- **[`Lenis`](https://lenis.darkroom.engineering)**：由於瀏覽器預設的滾動行為在停止滾動時會有明顯的卡頓，Lenis 可以讓動畫結束時較為流暢。
- **`ScrollTrigger`**：GSAP 的插件，將「頁面滾動距離」與「動畫時間軸」同步。

**核心實作：**

```javascript
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PageLayout() {
  // 1. 初始化平滑滾動 Lenis
  useEffect(() => {
    const lenis = new Lenis();
    // 將 Lenis 的滾動事件同步給 ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    return () => gsap.ticker.remove(update);
  }, []);

  // 2. 設定 GSAP ScrollTrigger 動畫
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".spacer", // 觸發動畫的容器
        start: "top top",   // 當容器頂部碰到視窗頂部時開始
        end: "bottom bottom",
        scrub: true,        // 動畫進度與滾動條綁定
      },
    });

    // 定義時間軸：文字放大消失、背景移動
    tl.to(".text-ref", { scale: 10, opacity: 0 })
      .to(".hero-title", { top: "0", left: "50%", x: "-50%" })
      .to(".video-wrapper", { borderWidth: 0 }, 0); // "<" 代表與前一個動畫同時發生
  });

  return (/* JSX 結構 */);
}

```

- **Live Demo:** [This is Taipei](https://this-is-taipei.vercel.app)
- **參考案例:** [Preciosa Components](https://unstoppable.preciosacomponents.com/zh/application-center)

## 3. 頁面過場動畫：View Transition

除了單一頁面的特效，頁面與頁面之間的「過場」（Transition）更能提升使用者體驗的連貫性。這邊稍微帶過過去在 `Astro`、`Next.js`、`React` 處理的例子，但核心邏輯都是：**「攔截路由切換 -> 執行離場動畫 -> 切換內容 -> 執行進場動畫」**。

### 3.1 Astro: 原生支援最簡單

Astro 對於 [View Transitions](https://docs.astro.build/zh-tw/guides/view-transitions/) 的支援非常完善，只需引入 `ClientRouter`，甚至不需要寫額外的 JS。

![](@/assets/space-tourism.gif)

```astro
---
import { ClientRouter } from "astro:transitions";
---
<head>
  <ClientRouter />
</head>

<nav transition:animate="fade">
  </nav>

```

- **Live Demo:** [Space Tourism](https://chious.github.io/fm-space-tourism-muiti-page/)

### 3.2 Next.js: 使用 `next-transition-router`

![](@/assets/page-transition.gif)

Next.js 的 App Router 架構下，我們可以利用 [`next-transition-router`](https://github.com/ismamz/next-transition-router) 來封裝過場邏輯。以下示範一個「網格遮罩」的過場效果。

**核心實作：**

```jsx
import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";

export default function TransitionProvider({ children }) {
  // 建立網格 DOM 的邏輯 (createTransitionGrid)
  const createTransitionGrid = () => {
    if (!transitionGridRef.current) return;

    const container = transitionGridRef.current;
    container.innerHTML = "";
    blocksRef.current = [];

    const gridWidth = window.innerWidth;
    const gridHeight = window.innerHeight;

    const cols = Math.ceil(gridWidth / BLOCK_SIZE);
    const rows = Math.ceil(gridHeight / BLOCK_SIZE);

    const offesetX = (gridWidth - cols * BLOCK_SIZE) / 2;
    const offesetY = (gridHeight - rows * BLOCK_SIZE) / 2;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const block = document.createElement("div");
        block.className = "transition-block";
        block.style.cssText = `
          width: ${BLOCK_SIZE}px;
          height: ${BLOCK_SIZE}px;
          left: ${offesetX + j * BLOCK_SIZE}px;
          top: ${offesetY + i * BLOCK_SIZE}px;
        `;
        container.appendChild(block);
        blocksRef.current.push(block);
      }
    }

    gsap.set(blocksRef.current, { opacity: 0 });
  };

  useEffect(() => {
    createTransitionGrid();

    window.addEventListener("resize", createTransitionGrid);
    return () => {
      window.removeEventListener("resize", createTransitionGrid);
    };
  }, []);

  return (
    <TransitionRouter
      auto
      // 離開當前頁面時執行
      leave={(next) => {
        gsap.to(".transition-block", {
          opacity: 1, // 網格浮現遮住畫面
          stagger: { amount: 0.5, from: "random" },
          onComplete: next, // 動畫結束後，執行路由切換
        });
      }}
      // 進入新頁面時執行
      enter={(next) => {
        gsap.to(".transition-block", {
          opacity: 0, // 網格消失顯示新內容
          delay: 0.3,
          stagger: { amount: 0.5, from: "random" },
          onComplete: next,
        });
      }}
    >
      <div className="transition-grid" />
      {children}
    </TransitionRouter>
  );
}
```

- **Live Demo:** [GSAP Grid Transition](https://page-transition-gsap-lovat.vercel.app)
- **Youtube Source:** https://www.youtube.com/watch?v=ngD_e4m45S0

### 3.3 React SPA: `react-transition-group` + Router

![](@/assets/this-is-taipei-2.gif)

如果是純 Vite + React 的 SPA 專案，則需要整合 `react-router-dom` 的 `useLocation` 與 `react-transition-group`。

**核心實作：**

```jsx
import { SwitchTransition, Transition } from "react-transition-group";
import { Routes, Route, useLocation } from "react-router-dom";
import gsap from "gsap";

const RouteTransition = ({ children, locationKey }) => {
  const nodeRef = useRef(null);

  return (
    // mode="out-in" 確保先執行完離場，再執行進場
    <SwitchTransition mode="out-in">
      <Transition
        key={locationKey} // 關鍵：利用 key 改變觸發重新渲染
        nodeRef={nodeRef}
        timeout={500}
        onEnter={() => {
          // 進場動畫：淡入
          gsap.fromTo(nodeRef.current, { opacity: 0 }, { opacity: 1 });
        }}
        onExit={() => {
          // 離場動畫：淡出
          gsap.to(nodeRef.current, { opacity: 0 });
        }}
      >
        <div ref={nodeRef} className="page-wrapper">
          {children}
        </div>
      </Transition>
    </SwitchTransition>
  );
};

// 在 App 中使用
function AppRoutes() {
  const location = useLocation();
  return (
    <RouteTransition locationKey={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </RouteTransition>
  );
}
```

- **Live Demo:** [This is Taipei](https://this-is-taipei.vercel.app)
- **Code:** [GitHub Repo](https://github.com/Chious/this-is-taipei)

## References

文件

- [GSAP Documentation](https://greensock.com/docs/)
- [Lenis Documentation](https://lenis.darkroom.engineering/docs)
- [React Transition Group Documentation](https://reactcommunity.org/react-transition-group/)
- [Astro Documentation | View Transitions](https://docs.astro.build/zh-tw/guides/view-transitions/)

教材/案例

- [GSAP ScrollTrigger](https://www.youtube.com/watch?v=DTTNSjyEtes)
- [Unstoppable Components](https://unstoppable.preciosacomponents.com/zh/application-center)

練習程式碼

- [This is Taipei](https://github.com/Chious/this-is-taipei)
- [Space Tourism](https://github.com/chious/fm-space-tourism-muiti-page)
- [GSAP Grid Transition](https://github.com/Chious/page-transition-gsap)
