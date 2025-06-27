---
title: 【XSS】前端的其他XSS攻擊方式
sidebar_position: 3
description: 這篇札記會介紹一些其他的 XSS 攻擊方式，例如：XSS in SVG, XSS in CSS
tags:
  - XSS
  - Web Security
---

:::note
這邊是《Beyond XSS：探索網頁前端資安宇宙》的第五章讀書會筆記。
:::

## 5-1： Click Jacking

> Click Jacking 是一種網站攻擊技術，透過 iframe 將目標網站隱藏在一個看不見的網頁中，並將 iframe 設定為透明，當使用者點擊透明的 iframe 時，實際上是點擊了目標網站的按鈕。

### 防範方式

#### 1. Frame busting：透過 JavaScript 來檢查是否在 iframe 中，如果是則將頁面導向到原始網站。

```javascript
if (top === self) {
  dociment.documentElement.style.display = 'block';
} else {
  top.location = self.location;
}
```

`self`：代表當前的 window，`top`：代表最上層的 window。

#### 2. `iframe` 的 `sandbox` 屬性：可以限制 iframe 的行為，例如：禁止表單提交、禁止腳本執行等。

#### 3. X-Frame-Options：透過 HTTP Header 來限制網站是否可以被 iframe。

> 不過 X-Frame-Options 在實作時，瀏覽器不會每一層都去檢查是否同源，因此可以被 nested 繞過，目前已經被 CSP 取代。

```plaintext
example.com/A.html
--> attacker.com
   ---> example.com/A.html
      ---> example.com/B.html
```

#### 4. CSP：frame-ancestors 指令可以限制 iframe 的來源。

```plaintext
Content-Security-Policy: frame-ancestors 'self' example.com
```

1. `none`: 不允許任何 iframe 載入。

2. `self`: 只允許同源的 iframe 載入。

3. `URI`：只允許特定的網站載入。

### 防禦總結

1. 使用 CSP：不允許 iframe 載入其他網站。
2. 只允許同源的 iframe 載入。

```plaintext
Content-Security-Policy: frame-ancestors 'self'

Content-Security-Policy: frame-ancestors 'self' example.com
```

### 無法防禦的 Click Jacking

- 例如 Facebook widget 的 `讚` 與 `分享` 按鈕，這些按鈕是透過 iframe 載入的，因此無法防禦 Click Jacking。

## 5-2：MIME Sniffing

> MIME Sniffing 是一種瀏覽器的行為，當瀏覽器無法判斷資源的 MIME Type 時，會透過檔案的內容來判斷 MIME Type，這樣的行為容易被攻擊者利用。

:::note
MIME type (Multipurpose Internet Mail Extensions，多用途網際網路郵件擴展) 是一種網際網路標準，最初設計用於擴展電子郵件的功能，使其能夠傳輸非 ASCII 字元的文字、非文字格式的附件（例如圖片、聲音、影片等），以及由多個部分組成的訊息。後來，MIME type 也被 HTTP 協議廣泛採用，用於標識在網路上傳輸的資料類型。
:::

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.write('<h1>hello</h1>');
  res.end();
});

// compare1
app.get('/', (req, res) => {
  res.write('<h2>hello</h2>');
  res.end();
});

// compare2
app.get('/', (req, res) => {
  res.write('hi', '<h1>hello</h1>');
  res.end();
});

app.listen(3000, () => {
  console.log('server is running on port 3000');
});
```

某些時候可以繞過 MIME Sniffing 的方式：

- `chrome`：不一定會檢查

- `firefox`：會檢查附檔名，如果附檔名是 `html`，則會將 `Content-Type` 設定為 `text/html`。

### 被攻擊會怎麼樣

- 有上傳的功能
- 但是沒有檢查內容物

:::note
備註：這些是主要瀏覽器支援的 content-type，可以執行 JavaScript 的 MIME Type：

1. text/html
2. application/xhtml+xml
3. application/xml
4. text/xml
5. image/svg+xml

:::

例如可以上傳一個 svg 檔案，然後在 svg 檔案中寫入 JavaScript。

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <script>
    alert('XSS');
  </script>
</svg>
```

### 防範方式

#### 1. 使用 X-Content-Type-Options

> 這個 Header 會告訴瀏覽器不要做 MIME Sniffing，直接使用 Server 回傳的 Content-Type。

```plaintext
X-Content-Type-Options: nosniff
```

#### 如果不做防禦會怎麼樣

情境：

1. 有上傳的功能，但是沒有檢查內容物
2. 有 CSP 但是只限制同源的 JavaScript 執行

## 5-3 前端供應鏈攻擊

> 前端供應鏈攻擊是一種攻擊方式，攻擊者會透過第三方套件來攻擊網站，例如：`event-stream`、`lodash`、`axios` 等等。

### 範例：cdnjs

> CDN 可以根據使用者的地理位置，將資源分發到最近的伺服器，這樣可以加速網站的載入速度。

使用 cdn 的原因

1. 偷懶
2. 開發速度快、節省成本

如果 CDN 被攻擊，則下游的網站也會受到影響。

### 攻擊方式

1. 利用 cdn 寫入特定路徑

```plaintext
檔名：../../lodash.js
CDN：https://cdnjs.cloudflare.com/ajax/libs/lodash.js
```

2. symbolic link

> symbolic link 是一種特殊的檔案，可以指向另一個檔案或目錄，這樣可以達到攻擊的目的。

```plaintext
ln -s /etc/passwd /var/www/html/passwd
```

- 在 Git 倉庫中新增 symbolic link，並讓 test.js 指向 `/etc/passwd`。
- 觸發 Git 自動更新，cdnjs 複製並公開該檔案，公開內容為 /etc/passwd 的內容。
- 攻擊者可以透過 CDN 的 URL 來取得 `/etc/passwd` 的內容。

### 防範方式

1. 使用瀏覽器的 Integrity 檢查

> Integrity 是一個屬性，可以檢查資源是否被竄改。可以自動記憶上一個（假設是安全版本的 CDN）

2. 使用自有的 CDN

## 5-5：XSLeaks 旁路攻擊

:::note
待補充
:::

```javascript
const express = require('express');
​​​​​​​​​​​​const app = express();

​​​​​​​​​​​​app.get('/200', (req, res) => {
​​​​​​​​​​​​  res.writeHead(200, {
​​​​​​​​​​​​    'Content-Type': 'text/html',
​​​​​​​​​​​​    'Cross-Origin-Resource-Policy': 'same-origin',
​​​​​​​​​​​​  });
​​​​​​​​​​​​  res.write('<h1>hlelo</h1>');
​​​​​​​​​​​​  res.end();
​​​​​​​​​​​​});

​​​​​​​​​​​​app.get('/400', (req, res) => {
​​​​​​​​​​​​  res.writeHead(400, { 'Cross-Origin-Resource-Policy': 'same-origin' });
​​​​​​​​​​​​  res.end();
​​​​​​​​​​​​});

​​​​​​​​​​​​app.get('/', (req, res) => {
​​​​​​​​​​​​  res.writeHead(200, {
​​​​​​​​​​​​    'Content-Type': 'text/html',
​​​​​​​​​​​​  });
​​​​​​​​​​​​  res.write(
​​​​​​​​​​​​    '<script src="/200" onerror=alert("200_error") onload=alert("200_load")></script>'
​​​​​​​​​​​​  );
​​​​​​​​​​​​  res.write(
​​​​​​​​​​​​    '<script src="/400" onerror=alert("400_error") onload=alert("400_load")></script>'
​​​​​​​​​​​​  );
​​​​​​​​​​​​  res.end();
​​​​​​​​​​​​});

​​​​​​​​​​​​app.listen(5555, () => {
​​​​​​​​​​​​  console.log('Server is running on port 5555');
​​​​​​​​​​​​});
```

:::note

loacl 版為了避免 `Same Site` 的問題, 改由上傳檔案的方式來執行

```plaintext
<script src="http://localhost:5555/200" onerror=alert("200_error") onload=alert("200_load")></script>
<script src="http://localhost:5555/400" onerror=alert("400_error") onload=alert("400_load")></script>
```

:::
