---
title: 【DVA-C02】AWS RDS + Aurora + ElastiCache 簡介
description: 簡介 AWS RDS、Aurora、ElastiCache 的差異與使用場景。
---

# AWS RDS

## 一、什麼是 RDS？

RDS 是 Amazon Relational Database Service 的縮寫，是 AWS 提供的關係型資料庫服務。

### RDS Replica

- 非同步複製，主資料庫實例的資料會非同步複製到只讀副本。

```mermaid
graph TD
    A[Application 應用程式] -->|寫入操作<br/>Write Operations| B[Main RDS Instance<br/>主資料庫實例]
    A -->|讀取操作<br/>Read Operations| B

    B -.->|非同步複製<br/>Async Replication| C[RDS Replica<br/>只讀副本]

    A -->|讀取操作<br/>Read Operations| C

    subgraph "資料庫層 Database Layer"
        B
        C
    end

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style B stroke:#9c27b0,stroke-width:2px
    style C stroke:#4caf50,stroke-width:2px

    classDef writeOp stroke:#f44336,stroke-width:2px,color:#f44336
    classDef readOp stroke:#2196f3,stroke-width:2px,color:#2196f3
    classDef asyncOp stroke:#ff9800,stroke-width:2px,color:#ff9800,stroke-dasharray: 5 5
```

### RDS Multi AZ (Disaster Recovery)

## 二、什麼是 Aurora？

Aurora 是 AWS 提供的關係型資料庫服務，是 RDS 的升級版。

- PostegreSQL / MySQL 相容

## RDS & Aurora 安全性（Security）

- In-flight encryption: 在傳輸過程中加密。
- IAM authentication: 使用 IAM 認證來連接 RDS 和 Aurora。
- Security Groups: 允許特定的 IP 地址或安全組來連接 RDS 和 Aurora。
- Addit Log: 可以將 RDS 和 Aurora 的日誌發送到 CloudWatch Logs。

## RDS Proxy

```mermaid
graph TB
    subgraph "Internet"
        User[使用者]
    end

    subgraph "VPC"
        subgraph "Private Subnet"
            App[EC2 應用程式]
            Lambda[Lambda Function]
            RDSProxy[RDS Proxy<br/>僅 VPC 內部存取]
            RDS[RDS Instance]
        end
    end

    User -.->|❌ 無法直接存取| RDSProxy
    App --> RDSProxy
    Lambda --> RDSProxy
    RDSProxy --> RDS

    classDef app fill:#e1f5fe
    classDef lambda fill:#f3e5f5
    classDef proxy fill:#fff3e0
    classDef database fill:#e8f5e8
    classDef user fill:#ffebee

    class App app
    class Lambda lambda
    class RDSProxy proxy
    class RDS database
    class User user
```

## ElastiCache

> Amazon ElastiCache 是一種完全受管的記憶體內快取服務 (in-memory cache service)。它旨在幫助你顯著提高 Web 應用程式的效能，透過允許你在高速的記憶體內快取中檢索資訊，而不是每次都依賴較慢的磁碟式資料庫。

## Cache 策略比較

| 特性 / 策略 | Lazy Loading (Cache-Aside)             | Write-through                                       | TTL                                                      |
| ----------- | -------------------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| 讀取        | 優先查快取，未命中則查 DB 並回填快取。 | 優先查快取，快取中始終有最新資料。                  | 設定資料過期時間，到期則失效，下次讀取時從 DB 重新載入。 |
| 寫入        | 先寫 DB，再使快取失效或更新。          | 同時寫入快取和 DB。                                 | 獨立於寫入策略，管理資料「新鮮度」。                     |
| 一致性      | 最終一致性，寫入後短暫不一致風險。     | 強一致性，快取與 DB 寫入同步。                      | 確保快取資料不會無限期陳舊，降低不一致風險。             |
| 延遲        | 首次讀取有延遲，寫入延遲低。           | 寫入延遲高，讀取延遲低。                            | 影響快取命中率，進而影響讀取延遲。                       |
| 快取利用    | 僅快取「熱門」數據，利用率高。         | 可能快取「冷門」數據，利用率可能低於 Lazy Loading。 | 定期清除舊數據，有助於高效利用快取空間。                 |
| 複雜度      | 實現相對簡單。                         | 實現相對簡單，但需處理雙重寫入失敗。                | 需配合讀寫策略使用，設定合適的過期時間是關鍵。           |

- 如果資料更新很慢、只需要記住簡單的 key-value pair => Cache

### Lazy Loading

```mermaid

graph TD
    App[Application]
    Cache[Amazon ElastiCache]
    RDS[Amazon RDS]

    App -->|1. 查詢資料| Cache
    Cache -->|Cache Hit 資料存在| App
    Cache -->|Cache Miss 資料不存在| RDS
    RDS -->|2. 從資料庫讀取| App
    App -->|3. 寫入快取| Cache

    classDef app fill:#e1f5fe
    classDef cache fill:#fff3e0
    classDef database fill:#e8f5e8

    class App app
    class Cache cache
    class RDS database
```

### Write Through: 當資料更新時，同時更新快取。

### Cache Evictions and Time to Live (TTL)

> 當快取空間不足時，快取系統需要決定移除（或「驅逐」）哪些現有資料，以便為新進入的資料騰出空間的過程。

- 當快取滿了，需要刪除一些資料。
- 可以設定 TTL，當資料過期後，自動刪除。
