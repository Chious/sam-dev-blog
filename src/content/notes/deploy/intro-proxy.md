---
title: 【草稿】初談伺服器代理
tags: [Proxy, HTTP, Nginx]
sidebar_label: 【草稿】初談伺服器代理
sidebar_position: 1
---

# 初談伺服器代理

## 前言

過去談到 Nginx 或是代理，總覺得好像淪為準備工作的面試題，直到前陣子看到了這篇文章 [Proxy vs Reverse Proxy (Real-world Examples)](https://www.youtube.com/watch?v=4NB0NDtOwIQ)，加上最近真的需要用上代理的經驗，才有一些頭緒。

---

通常在內部測試時，申請一台 VM 之後，便套用 Ubuntu 預設的設定 (HTTP)、設定好最基本的 CI/CD，然後就開始開發了。這樣的做法雖然方便，但卻會有一些問題：

前端常見的需求

- 需要將 API 的請求轉發到後端伺服器
- 某些自架內部服務需要使用 HTTPS，例如：[Outline](https://docs.getoutline.com/s/hosting/doc/docker-7pfeLP5a8t)
- 麥克風存取 `<audio>` 元素

```plaintext
- This site should be run in a secure context (HTTPS)
- Please ensure all links, iframe, and parent
- The webcam and other media devices may not be accessible while insecure.
- WHEP playback and some other features might still function.
```

至於這些問題要怎麼解呢，我們會先帶到一些概念介紹，再來看看常見的工具。

## 反向代理 vs 正向代理

## 案例一：使用 Nginx 進行反向代理

> 例如在 DigitalOcean 上架設一台 Nginx 伺服器，設定完安全性後，通常也會跟著一起設定 Nginx。

- Nginx
- Certbot

**註：這塊取自於 [Full Stack for Front-End Engineers, v3](https://frontendmasters.com/courses/fullstack-v3/) 課程部分的內容，有興趣可以參考。**

## 案例二：使用 Proxy Manager 進行反向代理

> 近期則出現了 Docker 的 Proxy Manager，這是一個基於 Nginx 的反向代理管理工具，讓使用者可以更方便地設定反向代理。

## 案例三： Proxy Manager + OpenSence

> 由於 Proxy Manager 的 SSL 預設是使用 Let's Encrypt 的憑證，但是通常公司內部會有自己的 CA 憑證，這時候就需要使用 OpenSence 來進行 SSL 的轉換。

```plaintext
[Internet]
   ↓
[OPNsense VM (Proxmox)]
   └─ 用 ACME Plugin 申請 SSL 憑證 (Let's Encrypt)
        ↓
   手動或自動將憑證匯出
        ↓
[Nginx Proxy Manager (Ubuntu VM)]
   └─ 使用該憑證代理 Next.js 到 HTTPS

```

## 參考資料

- [【Youtube】Proxy vs Reverse Proxy (Real-world Examples)](https://www.youtube.com/watch?v=4NB0NDtOwIQ)
- [【Docs】Nginx Proxy Manager](https://nginxproxymanager.com/)
- [【Docs】OpenSence](https://opnsense.org/)
- [【Docs】Let's Encrypt](https://letsencrypt.org/)
- [【Docs】Certbot](https://certbot.eff.org/)
