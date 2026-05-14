---
title: 週間紀錄：落點掃描及版本升級
---

## Part1：前言

回顧過去的經驗，大多仍是以開發為主。近期遇到的專案，由於業主需要驗 ISO 27001 的關係，在正式做掃描之前，先由內部做測試。既有的功能仍然需要持續的開發，但另外一方面仍然需要做弱點掃描。 `npm install` 安裝之後，發現了很多漏洞：

```plaintext
removed 111 packages, changed 1 package, and audited 608 packages in 6s

257 packages are looking for funding
  run `npm fund` for details

12 vulnerabilities (1 low, 3 moderate, 8 high)

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

除了常見的小套件： `date-picker`, `material`, `three` 之外，專案最核心的 `@angular/core` 居然需要從 `16` -> `19` 才能符合最小的安全版本。

## 弱點掃描

但其實對於公司或是自己來說，也是第一次做弱點掃描，對於自己來說也做了很多功課：

### 源碼掃描： Semgrep vs SonarQube

- 最後還是決定使用 Semgrep，因為掃描很容易，還有很容易找到對應的 CVE
- SonarQube 的強項還是在找 Code Smell 而不是弱點掃描，但是可以自己 host 服務

```shell
semgrep scan
  --config="p/owasp-top-ten"
  --config="p/cwe-top-25"
  --config="p/secrets"
```

也可以根據第三方掃描的結果，攥寫客製化規則：

```yml
rules:
  - id: github_example
    message: >-
      This is an example rule, that performs validation against github.com
    severity: MEDIUM
    languages:
      - regex
    validators:
      - http:
          request:
            headers:
              Authorization: Bearer $REGEX
              Host: api.github.com
              User-Agent: Semgrep
            method: GET
            url: https://api.github.com/user
          response:
            - match:
                - status-code: 200
              result:
                validity: valid
            - match:
                - status-code: 401
              result:
                validity: invalid
    patterns:
      - patterns:
          - pattern-regex: (?<REGEX>\b((ghp|gho|ghu|ghs|ghr|github_pat)_[a-zA-Z0-9_]{36,255})\b)
          - focus-metavariable: $REGEX
          - metavariable-analysis:
              analyzer: entropy
              metavariable: $REGEX
```

## Trivy

Trivy 主要是用來檢查基礎設施層

`docker-compose.yml`

```yml
services:
  dependency-check:
    image: owasp/dependency-check:latest
    volumes:
      - .:/src:ro
      - ./reports:/report
      - dependency_check_data:/usr/share/dependency-check/data
    environment:
      NVD_API_KEY: ${NVD_API_KEY:-}
    entrypoint: ["/bin/sh", "-c"]
    command:
      - |
        ARGS="--scan /src \
          --exclude '**/.angular/**' \
          --exclude '**/node_modules/**' \
          --exclude '**/dist/**' \
          --project smfa-frontend \
          --format JSON \
          --format HTML \
          --out /report"
        [ -n "$$NVD_API_KEY" ] && ARGS="$$ARGS --nvdApiKey $$NVD_API_KEY"
        /usr/share/dependency-check/bin/dependency-check.sh $$ARGS
    profiles:
      - scan

  trivy:
    image: aquasec/trivy:0.69.3
    volumes:
      - .:/src:ro
      - ./reports:/report
    command:
      - config
      - --format
      - json
      - --output
      - /report/trivy-dockerfile-report.json
      - /src/Dockerfile
    profiles:
      - scan

  sonar-scanner:
    image: sonarsource/sonar-scanner-cli:latest
    network_mode: host
    volumes:
      - .:/usr/src
    environment:
      SONAR_TOKEN: ${SONAR_TOKEN}
    profiles:
      - scan

  sonar-export:
    image: python:3.11-alpine
    volumes:
      - ./reports:/reports
      - ./scripts:/scripts
    network_mode: host
    environment:
      SONAR_TOKEN: ${SONAR_TOKEN}
    entrypoint: ["/bin/sh", "-c"]
    command:
      - |
        FOLDER=$(date +%Y-%m-%d:%H-%M)
        mkdir -p /reports/$$FOLDER
        mv /reports/dependency-check-report.json /reports/$$FOLDER/ 2>/dev/null || true
        mv /reports/dependency-check-report.html /reports/$$FOLDER/ 2>/dev/null || true
        python /scripts/sonar-report.py \
          --url http://localhost:9000 \
          --token "$$SONAR_TOKEN" \
          --project smfa-frontend \
          --output "/reports/$$FOLDER/sonar-report-$$FOLDER.html"
    profiles:
      - report

  sonarqube:
    # 9.9.3 是 LTS 版本
    image: sonarqube:26.3.0.120487-community
    # SonarQube 需要相依一個 db，這裡我們選用 postgres db
    depends_on:
      - postgres_db
    environment:
      # 設定 postgres 的連線資訊
      SONAR_JDBC_URL: jdbc:postgresql://postgres_db:5432/mysonar
      # 帳密建議可以改一下啦！
      SONAR_JDBC_USERNAME: mysonar
      SONAR_JDBC_PASSWORD: mysonar
      # 如果你的 Container 跑起來有遇到一些 ElasticSearch 的錯誤，可以試著加上這個參數。
      SONAR_ES_BOOTSTRAP_CHECKS_DISABLE: "true"
    # 主要的 data 直接存放在 docker volumes
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs
      # 掛載 dependency-check-sonar-plugin，SonarQube 啟動時會自動載入
      - ./sonar:/opt/sonarqube/extensions/plugins:ro
    # 預設使用 9000 port
    ports:
      - "9000:9000"
  postgres_db:
    # 2023.12.5 查看原廠文件，最新支援到 postgres 15
    image: postgres:15
    # 設定 postgresql db 的帳密，要跟前面的 DB 連線資訊一樣喔！
    environment:
      POSTGRES_USER: mysonar
      POSTGRES_PASSWORD: mysonar
    # db 的 data 也直接存放在 docker volumes 之中
    volumes:
      - postgresql:/var/lib/postgresql
      - postgresql_data:/var/lib/postgresql/data

# 將各個 docker volumes 建起來
volumes:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
  postgresql:
  postgresql_data:
  dependency_check_data:
```

## Part2：版本升級

### Angular

```shell
npx ng update @angular/core@21 @angular/cli@21
```

Angular 21 -> 發現依賴的 @angular/material 也需要跟著升級 -> 發現 pdf-viewer 也壞掉了 ...

#### 影響範圍

> 由於目前的程式碼在正式環境中仍然被許多客戶使用，在沒有足夠多的單元測試下，是透過 AI 小區塊、逐行判斷，接著才決定是否把版本升級上去。

升級 Angular 21 -> 判斷影響範圍 ->

#### 調整 CI

由於這次改動最主要的目的是要解決弱點掃描，但過去部署的流程略顯粗操， `npm run build` 產生 /dist -> 放置到 /app-backend 透過 expressjs 部署靜態檔案，結果導致後端沒有在為後的程式碼也一起算進來。

改動：

```docker
FROM node:24-alpine as builder

npm ci
COPY . .
npm run build

FROM nginx/unprivilege

...

```

#### 結果

- 由於比較新的版本開始支援透過 vite 打包 esbuild ，原本 HMR 時間 從 30 秒提升到只剩下 10 秒
- 原本 Gitlab CI 流程大概需要跑 7 分鐘，降到只剩下三分半
- 升級的時候順便把 `Karma` 棄用，並把 vitest 導入進來

### 其他套件升級

#### threejs

印象比較深刻的如 GLTFLoader，早期是透過 community 的版本（已經棄用很多年），後來才加入到 threejs 的 addon

```js
// 官方版本
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
```

還有像是燈光等等的參數也在版本更新中大調整

```

```
