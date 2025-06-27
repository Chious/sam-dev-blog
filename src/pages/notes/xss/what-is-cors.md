---
title: 【XSS】CSRF 與 CORS 攻擊
tags: ['XSS', 'Web Security', 'CSRF', 'CORS']
sidebar_label: 【XSS】CSRF 與 CORS 攻擊
sidebar_position: 2
---

:::note
這邊是《Beyond XSS：探索網頁前端資安宇宙》第三章讀書會筆記。
這一樓還在蓋，請稍後再來。
:::

## CSRF 攻擊

> CSRF（Cross-site request forgery）跨站請求偽造，是一種網站應用安全漏洞。該漏洞會導致用戶在不知情的情況下，以其身份對網站發送非預期的請求。這些請求可能包括更改用戶資料、發送郵件等操作。攻擊者通常會通過引誘用戶點擊特定的鏈接或訪問特定的網站，來觸發 CSRF 攻擊。

1. 攻擊者在自己的網站上放置一個連結，連結到受害者的網站上。

```html
<a href="wendy-website.com/delete?id=1">刪除文章</a>
```

同時 Cookie 也會被帶入，這樣就可以進行 CSRF 攻擊。

2. 透過 image

```html
<img src="wendy-website.com/delete?id=1" />
```

3. form

```html
<form action="wendy-website.com/delete" method="POST">
  <input type="hidden" name="id" value="1" />
  <input type="submit" value="刪除文章" />
</form>
```

## 防禦 CSRF 攻擊

### Same Site Cookie

1. 單純設定 `SameSite` 屬性

> SameSite Cookie 是一種 Cookie 的屬性，可以讓瀏覽器在發送跨站請求時，不會帶上 Cookie。這樣就可以防止 CSRF 攻擊。

- 可以設定 `Strict` 或 `Lax`，`Strict` 表示完全禁止第三方 Cookie，`Lax` 表示只有 GET 方法會帶上 Cookie。

- `Lax`: 只有 GET 方法會帶上 Cookie，POST 方法不會帶上 Cookie。
- `Strict`: 完全禁止第三方 Cookie。

```javascript
document.cookie = 'name=value; SameSite=Lax';
```

2. 準備兩組 Cookie

- 一組是 `SameSite` 設定為 `Strict`，另一組是 `SameSite` 設定為 `Lax`。

```javascript
document.cookie = 'name=value; SameSite=Strict'; // 允許 POSt 方法
document.cookie = 'name=value; SameSite=Lax'; // 允許 GET 方法 => 應用於需要使用者體驗的場景
```

### 但是有可能被繞過

1. 透過 `GET` 方法

```plaintext
GET http://wendy-website.com/delete?id=1
```

2. 透過表單提交

```html
<form action="wendy-website.com/delete" method="POST">
  <input type="hidden" name="id" value="1" />
  <input type="submit" value="刪除文章" />
</form>
```

### 可以防禦 Same Origin 但可能防禦不到 Same Site

- facebook.com
- sandbox.facebook.com

## 攻擊網站範例

1. Subdomain Takeover

> Subdomain Takeover 是一種網站應用安全漏洞。當一個子域名指向的服務不再使用時，攻擊者可以註冊該子域名，並將其指向自己的服務。這樣攻擊者就可以在該子域名上執行任意 JavaScript 代碼，進而竊取用戶的 Cookie。

- S3 被刪除、但是 DNS 設定還在

2. 錯誤的 CORS 設定

```javascript
const domain = 'huli.tw';

// 避免未知的假設
if (origin === domain) {
  res.setHeader('Access-Control-Allow-Origin', domain);
}
```

### Cookie Toosie

> 透過子網域的 Cookie 去覆蓋主網域的 Cookie

s3.holi.tw 可以覆蓋 holi.tw 的 Cookie

### 防禦

1. 使用 \_\_Host- 的 Cookie 屬性

- 例如：`__Host-`，`__Secure-`

2. 分流：

- 主網域：放重要的
- 子網域：放不重要的
