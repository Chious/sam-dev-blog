---
title: 【DVA-C02】AWS 介紹
tags: ["AWS"]
sidebar_label: 【DVA-C02】AWS 介紹
---

# AWS 介紹

## 前言：為什麼打算學 AWS？

最近這陣子發現，作為一個前端工程師，編寫 React 或是其他前端專案僅是作為工作上的一環。在開發結束之後，需要告訴 PM 或是客戶，某個功能已經完成了，這些都是工作中的一環，甚至是後續 CI/CD 的維護、部署、上線等。

懂一些雲端服務，也讓日常的開發有更多工具可以使用，例如：

- EC2：建立內部服務（如：[Outline](https://docs.getoutline.com/s/hosting/doc/docker-7pfeLP5a8t)）、測試環境等

- Route 53：管理域名、http -> https 的轉址（反向代理）

- S3：存取資源的容器（如：靜態網站、媒體檔案等）

## AWS 是什麼？

AWS 是 Amazon Web Services 的縮寫，是 Amazon 提供的雲端服務。

## AWS 常用的服務

- [x] IAM: 控制 AWS 資源的存取的權限
- [x] EC2: 提供虛擬機器（VM）
- [x] S3: 存取資源的容器（如：靜態網站、媒體檔案等）
- [ ] RDS: 提供關係型資料庫（如：MySQL、PostgreSQL 等）
- [ ] DynamoDB: 提供 NoSQL 資料庫（如：Key-Value 資料庫）
- [ ] Lambda: 提供無伺服器（Serverless）的函式計算服務
- [ ] CloudFront: 提供內容傳遞網路（CDN）服務
- [ ] Route 53: 提供域名系統（DNS）服務
- [ ] CloudWatch: 提供監控服務
- [ ] CloudTrail: 提供日誌服務
- [ ] VPC: 提供虛擬私有雲（VPC）服務

### Legacy Services

#### CI/CD

- CodeCommit
- CodePipeline

## 備註

練習 AWS 服務的時候，建議控制預算上限，或是關閉不必要的服務，避免不必要的支出。（曾經被意外扣了一筆錢 🥲）
