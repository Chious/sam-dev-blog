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

---

## Kensis (Real-time)

> 可以視為一個高傳輸量的緩衝區，負責接收、暫時或是保留傳入的即時訊息，可以與其他的 AWS 服務整合，例如：想要將接收的資料存入資料庫：

- 應用程式（Application）：通常是客戶端，傳送資料到 Kinesis Stream
- Kinesis Data Streams：是輸送帶，將產品暫時擺放在上面，並確保它們按照順序排列。
- RDS：是資料庫，用來長期儲存資料的地方。

可以透過如 `Lamdba function`、`Data Firehose`，來整合 Kinesis 與 RDS。

| 特性     | Provisioned Mode (預置模式)              | On-demand Capacity Mode (隨需容量模式) |
| -------- | ---------------------------------------- | -------------------------------------- |
| 計費方式 | 按預先配置的容量計費                     | 按實際讀寫次數計費                     |
| 效能管理 | 手動或自動調整讀寫容量                   | 全自動，無需手動管理                   |
| 適用場景 | 工作負載穩定、可預期，需要成本控制的應用 | 工作負載不可預測、流量尖峰差異大的應用 |
| 主要優勢 | 成本可預期且通常更低                     | 彈性高、管理簡單                       |
| 主要風險 | 流量暴增時可能節流                       | 成本可能超出預算                       |

```shell
aws kinesis put-record --stream-name my-stream
--partition-key 123
--data "Hello, World!"
--data-type "text"
```

`response`

```shell
{
    "ShardId": "shardId-000000000000",
    "SequenceNumber": "49596280243459345917234234567890",
    "EncryptionType": "NONE"
}
```

### Apache Flink

> Apache Flink 是一個開源的流處理框架，可以與 Kinesis 整合，用來處理即時的資料。

## 比較 SQS vs SNS vs Kinesis

### SQS (Simple Queue Service)

- 消費者「拉取 (Pull)」資料：這是一個訊息佇列服務，消費者（例如，您的應用程式或伺服器）會主動向 SQS 佇列發出請求，以拉取（receive）訊息來進行處理。

- 讀取後資料會被刪除：當消費者成功處理完一條訊息後，它會向 SQS 發送一個刪除請求，該訊息就會從佇列中移除。這確保了每個訊息通常只會被一個消費者處理一次。

- 可以有任意數量的 Worker (消費者)：SQS 具有高度的擴展性。您不需要限制消費者的數量，可以根據處理需求增加或減少 Worker，而 SQS 會自動處理負載平衡。

- 無需預置吞吐量：SQS 是一種**隨需（on-demand）**服務。您無需像其他服務那樣預先設定讀取或寫入容量，它會根據您傳送或接收訊息的數量自動擴展，並依實際使用量計費。

### SNS (Simple Notification Service)

- 將資料推送 (Push) 到多個訂閱者：這是一個發布/訂閱服務。當發布者發送一條訊息到 SNS 主題時，SNS 會自動將這條訊息推送給所有訂閱了該主題的消費者。

- 最多 12,500,000 個訂閱者：一個 SNS 主題可以支援非常龐大的訂閱者數量，這使其非常適合大規模的廣播通知，例如：即時通知、電子郵件、簡訊推播等。

### Kinesis

- 標準模式：拉取 (Pull) 資料：Kinesis Data Streams 的消費者也是以拉取的方式從分片（shards）中讀取資料。消費者會持續發送請求以獲取新的資料紀錄。

- 每個分片 (Shard) 2 MB：這指的是每個分片每秒的讀取吞吐量上限。一個分片每秒最多可以讀取 5 筆交易，總資料量不超過 2 MB。如果要提高總吞吐量，需要增加分片的數量。

- 用於即時大數據、分析與 ETL：Kinesis 專為處理即時串流資料而設計。它非常適合用於即時儀表板、使用者行為分析、系統日誌監控，以及作為 ETL (Extract, Transform, Load) 流程中的第一步。

- 資料會在 X 天後過期：Kinesis Data Streams 中的資料是暫時性的。預設資料會保留 24 小時，但可以設定延長到最多 1 年。這讓您有機會在發生問題時，能夠重新處理過去的資料。

---

TD;LR

- Long Polling
- DelaySeconds
- Increase the Visibility Timeout
- Classic Fan-out Comsumer / Enhanced Fan-out Comsumer

- Dead Letter Queue (DLQ) -- 為了 Debug
