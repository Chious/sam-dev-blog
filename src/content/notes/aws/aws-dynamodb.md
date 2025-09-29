---
title: AWS DynamoDB
date: 2025-09-11
---

## AWS DynamoDB

AWS DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. It is a key-value and document database that supports both document and key-value models.

## DynamoDB

- Partition key: 代表資料的唯一性
- Sort key: 代表資料的排序方式

## Read/Write Capacity

- Provvision Mode: 預先配置的容量
- On-demand Mode (default): 按需配置的容量

### 寫入（Write）

> WCU: Write Capacity Unit: 代表每秒寫入 1KB 的資料量

- example1: we write 10 items per second, with item size 2KB
  WCU = 10 \* (2KB/1KB) = 20WCU

- example2: we write 120 items per minute, with item size 2KB
  WCU = (120 / 60) \* (2KB/1KB) = 4WCU

### 讀取（Read）

> RCU: Read Capacity Unit 代表 Strong Consisten Read or 兩個 Eventual Consistent Read 每秒讀取 4KB 的資料量

- Strongly Consistent Read（強一致性讀取）：強制在上一筆寫入完成後，才能讀取到最新資料。

- Eventual Consistent Read（最終一致性讀取）：不保證在上一筆寫入完成後，才能讀取到最新資料，可能會取到重複（replicated）的資料。

example1: 10 Strong Read per second, with item size 4KB
RCU = 10 \* (4KB/4KB) = 10RCU

example2: 16 Eventually Reads per second, with item size 12KB
RCU = (16/2) \* (12KB/4KB) = 24RCU

## Frature

### Throttling（限流）

- 如果超過 RCU 或 WCU 上限，會出現 `ProvisionedThroughputExceededException`

e.g.

- Hot Key: 某些資料太熱門，導致 RCU 或 WCU 超過上限。

- Exponential backoff with DynamoDB SDK: 在應用程式層面處理 DynamoDB Throttling 的標準做法。當你的應用程式向 DynamoDB 發出請求並收到 ThrottlingException 或其他服務錯誤時，不應該立即重試。

- Distribute partition keys：將流量分散到多個 partition key，避免單一 partition key 過度使用。
  - 例如，如果你的資料與日期相關，不要只用 YYYY-MM-DD 作為 Partition Key，因為這會導致一整天的資料都集中在同一個分區。可以考慮加入其他高基數的屬性，例如用戶 ID 或裝置 ID，來確保每個鍵都具有足夠的唯一性。
