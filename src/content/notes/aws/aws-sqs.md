---
title: 【DVA-C02】AWS SQS
date: 2025-07-27
tags: ["AWS", "SQS"]
description: "AWS SQS 簡介"
---

# AWS SQS & SNS & Kinesis

## 一、什麼是 AWS SQS？

- 處理異步（非同步）事件：

  - 例如：報告生成、圖像處理

- 流量消峰
  - 例如：演唱會搶票、訂單處理、電子郵件發送
  - 流量消峰：在流量高峰時，將流量分散到多個實例，避免單一實例負載過高。

### Standard Queue
