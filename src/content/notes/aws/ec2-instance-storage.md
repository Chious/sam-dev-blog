---
title: 【DVA-C02】EC2 Instance Storage
tags: ["AWS", "EC2"]
sidebar_label: 【DVA-C02】EC2 Instance Storage
---

:::note
這邊是《Ultimate AWS Certified Developer Associate 2025 DVA-C02》的讀書筆記。
:::

# 什麼是 EBS Volume？

> EBS Volume 是一種可以掛載到 EC2 instance 的 block storage，類似於硬碟。即便 EC2 關閉了，EBS Volume 仍然會保留資料（persist data）。

## Features

- Network drive
  - 他使用網路來連接到 EC2 instance
  - 可以隨時 detach 並 attach 到其他 instance
- 鎖定在可用區域（Availability Zone）
  - EBS Volume 是跟著可用區域走的
  - 一個 EBS Volume 只能掛載到一個 instance
- Have a provisioned capacity
  - 需要指定容量大小
  - 一旦指定，就無法縮小容量，只能增加

```mermaid
graph TB
    subgraph AZ["us-east-1a (AZ)"]
        direction TB

        subgraph EC2_1[EC2 Instance 1]
            APP1[Application 1]
        end

        subgraph EC2_2[EC2 Instance 2]
            APP2[Application 2]
        end

        EBS1["EBS Volume 1<br/>(10 GB)"]
        EBS2["EBS Volume 2<br/>(20 GB)"]
        EBS3["EBS Volume 3<br/>(10 GB)"]
        EBS4["EBS Volume 4<br/>(20 GB)"]
        EBS5["Unattached EBS<br/>(Available)"]
    end

    EC2_1 --> EBS1
    EC2_1 --> EBS2
    EC2_2 --> EBS3
    EC2_2 --> EBS4

    style AZ fill:#f5f5f5,stroke:#333,stroke-width:2px
    style EC2_1 fill:#FFE4C4,stroke:#333,stroke-width:2px
    style EC2_2 fill:#FFE4C4,stroke:#333,stroke-width:2px
    style EBS1 fill:#E6E6FA,stroke:#333,stroke-width:2px
    style EBS2 fill:#E6E6FA,stroke:#333,stroke-width:2px
    style EBS3 fill:#E6E6FA,stroke:#333,stroke-width:2px
    style EBS4 fill:#E6E6FA,stroke:#333,stroke-width:2px
    style EBS5 fill:#E6E6FA,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```
