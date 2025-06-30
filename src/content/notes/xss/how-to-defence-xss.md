---
title: 【XSS】XSS 讀書會2：阻擋XSS攻擊的三道防線——清除、過濾、風險分離
tags: ['XSS', 'Web Security']
sidebar_label: 【XSS】阻擋XSS攻擊的三道防線
sidebar_position: 0
---

:::note
這邊是《Beyond XSS：探索網頁前端資安宇宙》序章讀書會筆記。
:::

## 前言：為什麼要做 XSS 防禦？

在前一個章節介紹到：由於 Browser 與 server 的環境步一樣，可以受到 client 任意的修改，並注入程式碼。這個章節主要會介紹前端該如何防範。

## 關卡一、清除（Sanitization）

在開發的時候，常常聽到後端說要把所有打進來的 request 視為文字，而不是視為程式碼。因為對於資料庫而言，如果我可以直接輸入 `SELECT id, name, email FROM customers` 而撈到資料的話，則會出現 SQL Injection。對於前端而言，如果沒有事先過濾資料，則會在客戶端生成非預期的元素。

### 編碼（Encoding） & 清除（Sanitization） 是什麼？

> 那麼最根本的方式，就是讓注入點的程式碼不要起作用就好了，最常見的有兩種方式：

- 編碼（Encoding）：指的是在處理的過程中，將輸入的特殊字元進行編碼（`&` 轉成 `&amp;`），讓他視為文字的話，就不執行程式碼。
- 清除（Sanitization）：指的是過濾掉資料中不安全的部分然後再輸出。

### Encoding：Handlebar 樣板引擎的過濾

在 SPA 流行之前，早期很多都是透過後端的樣板引擎來輸出前端的程式碼。以 handlebars 為例子，我們在輸出時需要帶入 `doesWhat` 的資料，如果使用 `{{}}` 與 `{{{}}}` 會做不同的處理。

```html
<!-- Include Handlebars from a CDN -->
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js"></script>
<script>
  // compile the template
  var template = Handlebars.compile('Handlebars <b>{{doesWhat}}</b>');
  // execute the compiled template and print the output to the console
  console.log(template({ doesWhat: 'rocks!' }));
</script>
```

a. `{{}}`：自動將 HTML 編譯

- 作用： 將插入的數據自動轉換為 HTML 安全的格式。
- 目的： 防止 XSS (跨站腳本攻擊) 等安全漏洞。
- 行為： 會將特殊字符（如 \<, >, & 等）轉換為 HTML 實體（例如 `&lt;`, `&gt;`, `&amp;`）。

b. `{{{}}}`

- 作用： 直接插入原始數據，不進行任何轉譯。
- 用途： 當你確定插入的數據是安全的，並且需要保留原始的 HTML 格式時使用。

> 補充： Handlebar 的處理過程，可以參考原始的[程式碼](https://github.com/handlebars-lang/handlebars.js/blob/master/lib/handlebars/utils.js#L61)

### 案例：React 當中使用 `dangerouslySetInnerHTML` 進行客製化上稿

在當今的前端框架（如：React, Vue, Angular），就像是前面提到的一樣，都會事先經過重新編碼（Encoding），確保輸出的結果一定是純文字。

但是當我們在後台（admin）使用編輯器輸入資料時，我們就會使用到 `dangeriouslySetInnerHTML` 來 Render 資料的內容。

![截圖 2024-11-11 下午9.52.38](https://hackmd.io/_uploads/SJHBhFkMJx.png)

但是萬一如果使用者輸入的是注入攻擊怎麼辦？像是攻擊者只要輸入這一串程式碼，就能在客戶端（Browser）的環境，執行任何程式碼。

```html
<img src="not_exist" onerror="alert(你被攻擊了！)" />
```

因此在真正 render 出物件時，可以先將內容過濾掉，確保最後執行的程式碼是安全的。

```javascript
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize('<b>hello there</b>');

//...

return <div dangerouslySetInnerHTML={{ __html: clean }} />;
```

> 參考閱讀：[【Blog】Using dangerouslySetInnerHTML in a React application](https://blog.logrocket.com/using-dangerouslysetinnerhtml-react-application/)

## 關卡二、設定 CSP（Content Security Policy） 規則

> 但是需要防堵的注入點這麼多，我如何確保所有攻擊點都有事先處理過？因此我們可以在伺服器端為整份文件寫入一些簡單的規則，確保只有某些程式碼可以執行。

![截圖 2024-11-11 下午10.25.06](https://hackmd.io/_uploads/HJM-NcJfke.png)

簡單來說，前端需要在 server 端根據 HTTP 的標頭設定規則，然而設定的方式根據專案類型而異，目前 Google 到的資料可以參考[這篇的做法](https://www.stackhawk.com/blog/react-content-security-policy-guide-what-it-is-and-how-to-enable-it/)。

\*註解： 對於 SPA 來說，像是上面的範例加在 react `index.html` 的 `<meta>` 當中可能是沒有意義的，因為 client 端的程式碼可能會被更改，應該要設定在 server 當中。

### 常見的規則

> 這邊初估列出幾個，詳見可以參考 [MDN 的文件](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)

| CSP 規則        | 用途                                                                    |
| --------------- | ----------------------------------------------------------------------- |
| **default-src** | 設定預設允許載入資源的來源。通常設為 'self'，表示只允許來自同源的資源。 |
| **script-src**  | 指定允許執行腳本的來源。可限制內嵌腳本、外部腳本的來源。                |
| **style-src**   | 指定允許樣式表（CSS）的來源。可限制內嵌樣式、外部樣式表的來源。         |
| **img-src**     | 指定允許圖片的來源。可防止 XSS 攻擊通過圖片引入惡意腳本。               |
| **object-src**  | 指定允許 `<object>`、`<embed>`、`<applet>` 等標籤的來源。               |

> 延伸閱讀：[CSP Evaluator](https://csp-evaluator.withgoogle.com) （可以用來初步頻估網站的 CSP 規則是否周全）

### 如果遇到需要嵌入 `<script>` 怎麼辦？

> 如果今天已經寫了規則阻止 `<script>` 執行 javascript，但是地三方服務需要用到怎麼辦？前端常見的範例：Google Analytic（使用者分析）、[Facebook SDK](https://developers.facebook.com/docs/javascript/examples)（分享、留言功能）

以 Google Analytic 為例子：

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());

  gtag('config', 'G-XXXXXXXXXX');
</script>
```

> 參考資料：[Google Analytic 的開發者手冊](https://developers.google.com/analytics/devguides/collection/ga4/events?hl=zh-tw&client_type=gtag)

### 解法：在 `<script>` 上面加上後端產生的 nonce

常見的做法是請後端在 server 自動產生一個 nonce（隨機的密碼） ，並綁定在目標上，如果客戶端的密碼與 server 端的密碼不一致時，則會忽略這個請求。

![scriptsafe-fed37d1304a491e76e4d04d1e74b7271](https://hackmd.io/_uploads/BkSV85yMke.png)

不過通常後端要處理的過程很麻煩。目前手邊找到 NextJS 的範例供參考：

```typescript
// middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  );

  return response;
}
```

\*註解：NextJS 本質上是在 Server 的環境，因此可以直接設定 CSP 的規則。

> 參考資料：[【NextJS】Content Security Policy](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)

## 關卡三、風險分離：即使拿到 token 也不能做什麼

> 萬一攻擊者真的通過層層的關卡注入腳本，下一步能夠關注的事情是：『**駭客能夠利用客戶的 token 達成什麼事情？**』。

### 1. 二階段驗證

最常見的是銀行轉帳時需要輸入手機的驗證密碼，這是確保就算駭客能夠在瀏覽器取得客戶的驗證訊息，但駭客不一定有手機簡訊中的密碼。這也是典型就算在一個地方拿到 token 也沒用的例子。

### 2. BFF（Backend For Frontend Pattern）

自己比較粗淺的理解是，BFF 是後端另外架設一個 server 來記住使用者的登入狀態。在真的打到 API 前，後端會先在 Authorization Server 檢查使用者是否有登入。所有的登入資訊都不會儲存在客戶端（browser）當中。

![spa-oidc-oauth-architecture](https://images.ctfassets.net/23aumh6u8s0i/43eXspNnMJS3ImbvAva0R9/5cf40b564dcbd03eb7394c15078d8b63/bff-architecture.png)

圖片來源：https://auth0.com/blog/the-backend-for-frontend-pattern-bff/

- OS：感謝 Huli 大大在讀書會時補充，其實 NextJS 也是基於 BFF 的模式

> 延伸閱讀：[【Medium】前端開發者該負責寫 API Endpoints 嗎？The Backend For Frontend Pattern (BFF) In Microservices World](https://medium.com/starbugs/前端開發者該負責寫-api-endpoints-嗎-the-backend-for-frontend-pattern-bff-in-microservices-world-1368362c141c)

### 3. 前端使用 Web Worker

> main thread(前端) => worker thread(前端) => 後端

因為沒有使用過 Worker，自己比較粗淺的理解是，我們都知道 Javascript 是單線執行（one thread）的語言，而 worker 就是在 browser 當中針對驗證訊息另外建立一個執行序分開儲存驗證內容。

> 延伸閱讀：[【MDN】使用 Web Worker](https://developer.mozilla.org/zh-TW/docs/Web/API/Web_Workers_API/Using_web_workers)

## 結語

雖然這個章節介紹了這麼多防禦機制，不過實際開發上還是要考慮到實體需求。如果只是經營部落格文章而設立層層關卡，免得有點用**大砲打小鳥**。但是另外考慮到對於金融、醫療產業來說，如果 token 遺失的需要付出的代價很大，那麼這個時候就該考慮提升資安的要求。
