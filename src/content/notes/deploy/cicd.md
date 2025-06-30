---
title: 【Gitlab】環境建置及 CI 初嘗試
sidebar_position: 1
description: 因此最近趁著專案的空檔，透過一些小服務來熟悉環境建置的流程。這篇週間札記就來分享一下我在環境建置及 CI 上的初嘗試
tags: ["React", "Virtual DOM"]
---

## 前言

平常的時候有耳聞，前端工程師雖然把網站建好了，但是要把 React 專案部署到客戶指定的 Server 上通過驗收，也是一個大問題。加上最近因為待的團隊偏小，也在環境建置上遇到很多奇怪的問題：

> 為什麼我改了環境變數，但是 Docker 還是沒有部署到 3306 port 上？
> 我已經想好怎麼寫程式碼，但是我要怎麼架一個服務，讓同事或是客戶可以看到我的成果？

如果把視野拉大，在建置 React 專案之外，Work Flow 也有許多需要人工處理的事情：

![](https://docs.gitlab.com/ee/ci/img/get_started_cicd_v16_11.png)

> 圖片來源：https://docs.gitlab.com/ee/ci/

- Plan：規劃專案的需求
- Code：撰寫程式碼
- Test: 測試程式碼 -- 日常工作在這
- Review：Code Review
- Deploy：部署程式碼到客戶指定的 Server

因此最近趁著專案的空檔，透過一些小服務來熟悉環境建置的流程。這篇週間札記就來分享一下我在環境建置及 CI 上的初嘗試。

這篇會介紹到：

- Docker
- Gitlab Runner & Ubuntu Setup

## 目錄

- [什麼是 CI/CD](#什麼是-cicd)
- [Docker 與環境建置](#1docker-與環境建置)
  - [VM vs Docker](#1-1-vm-vs-docker)
  - [Dockerfile & Docker Compose](#1-2-dockerfile--docker-compose)
- [Gitlab Runner & Ubuntu Setup](#2-1-gitlab-runner)
  - [安裝所需的套件](#2-2-1-安裝所需的套件)
  - [設定 Gitlab Runner](#2-2-2-設定-gitlab-runner)
  - [設定 `.gitlab-ci.yml`](#2-2-3-設定-gitlab-ciyml)
- [結語](#結語)

## 什麼是 CI/CD

CI/CD 是持續整合（Continuous Integration）和持續部署（Continuous Deployment）的縮寫，是一種軟體開發實踐，藉由自動化的流程來測試、打包、部署程式碼。

- CI：持續整合，是指開發者將程式碼整合到共享儲存庫中，然後自動化的進行測試，確保程式碼的品質。

- CD：持續部署，是指將程式碼部署到生產環境中，並且自動化的進行部署。

## 1、Docker 與環境建置

在真的跳到如何建置 Docker 之前，先聊一下之前從頭開始架設 Server 的產痛經驗。透過 Digital Ocean 起一個虛擬機，並建立一個服務大概需要經歷這個流程：

但是透過 Docker，只要租借好一台虛擬機，只要執行

```bash
docker pull // 從 Docker Hub 下載已經建立好的 Image
docker run -p 3000:3000 // 建立 Container, 並且將Docker內部的 3000 port對應到本機的 3000 port
```

就可以建立一個服務，這樣就可以省去很多時間在環境建置上。

### 1-1 VM vs Docker

在很早之前，分配服務是以記憶體的方式來分配的，例如記憶體的某一個區塊切出一個虛擬機器，然後在這個虛擬機器上安裝作業系統、建立防火牆，在作業系統上安裝應用程式。但是以 APP 的角度出發，我們可能需要根據不同專案有不同的 node 版本環境，這樣的話，就會有很多不同的 VM 來管理。

```bash
nvm use 14 // 專案 A 需要 node 14
```

而 Docker 讓環境建置更加輕巧，透過 Dockerfile 來建立 Image，然後透過 Image 來建立 Container，這樣就可以達到『一次建立，到處運行』的效果。

註：Image 就像是一個藍圖，Container 是根據藍圖建立的實體，也就是實際執行的環境。

```dockerfile
FROM node:14 // 使用 node 14 的 Image

WORKDIR /app // 設定工作目錄在 /app

COPY package.json . // 複製 package.json 到 /app

RUN npm install // 安裝 package.json 的套件

COPY . . // 複製所有檔案到 /app

CMD ["npm", "start"] // 執行 npm start
```

接著就可以透過 terminal 來建立 Image，然後建立 Container。

```bash
docker build -t my-node-app . // 建立 Image
docker run -p 3000:3000 my-node-app // 建立 Container, 並且將Docker內部的 3000 port對應到本機的 3000 port
```

## 1-2 Dockerfile & Docker Compose

如果有多個服務需要建立，這時候就可以透過 Docker Compose 來管理多個 Container。我們需要在每一個專案資料夾定義好 Dockerfile，然後在根目錄透過 `docker-compose.yml` 來管理。

```yaml
version: '3'
services:
   frontend:
      build: ./frontend
      image: Dockerfile
     ports:
       - "3000:3000"
   backend:
       build: ./backend
       image: Dockerfile
       ports:
          - "3001:3001"
   mongo:
      image: mongo
      ports:
         - "27017:27017"
```

這樣就可以透過 `docker-compose` 來一次啟動所有服務。

```bash
docker-compose build // 建立所有 Image
docker-compose up // 啟動所有 Container
```

## Gitlab Runner & Ubuntu Setup

在本地打包好專案後，就是我們心心念念的怎麼簡單在 Server 上面跑 `docker-compose up` 起服務，這邊以 Gitlab 的自動化流程為例。

### 2-1 Gitlab Runner

> 在接觸 Gitlab Runner 之前，其實自己也很好奇，CI / CD 倒底是誰在觸發。簡單來說我們就是委託一個像是 Gitlab Runner / Github Action 這樣持續在監控的代理人，在被授予權限後，替我們在 VM 上執行 CI / CD 流程。

根據官方的文件，Gitlab Runner 可以在幾個不同的環境中執行，例如：

- Giltab 幫你管理的 Runner（GitLab-hosted）
- 自己的 Server（Self Management）

詳情可以參考：[GitLab Runner](https://docs.gitlab.com/runner/)

今天挑選的是自己的 Server 出來講。

### 2-2 Ubuntu Setup

### 2-2-1 安裝所需的套件

```bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin // 安裝 Docker,詳情參考官方說明
sudo apt-get install gitlab-runner // 安裝 Gitlab Runner
```

然後需要給予 Gitlab Runner 執行 Docker 的權限。

```bash
sudo usermod -aG docker gitlab-runner
```

### 2-2-2 設定 Gitlab Runner

**Ubuntu 環境**

1. 需要確保 Gitlab Runner 有組織的憑證，例如 `my-org.crt`，並更新憑證

> 詳情參考 [Self-signed certificates or custom Certification Authorities](https://docs.gitlab.com/runner/configuration/tls-self-signed.html)

```bash
sudo cp my-org.crt /usr/local/share/ca-certificates/my-org.crt // 複製憑證到目標資料夾
sudo update-ca-certificates
```

2. 給予 Gitlab Runner 目標資料夾的管理權限

```bash
sudo chown -R gitlab-runner:gitlab-runner /opt/my-project
sudo chmod -R 755 /opt/my-project
```

| 權限類型 | 數字表示 | 符號表示 | 說明                                                |
| -------- | -------- | -------- | --------------------------------------------------- |
| 讀取     | 4        | r        | 允許讀取檔案內容或列出目錄內容。                    |
| 寫入     | 2        | w        | 允許修改檔案內容、在目錄中新增或刪除檔案。          |
| 執行     | 1        | x        | 允許執行檔案 (如果是程式) 或進入目錄 (如果是目錄)。 |
| 無權限   | 0        | -        | 不允許任何操作。                                    |

`755` 代表的涵意:

- 擁有者：7 (4+2+1) = 讀取、寫入和執行
- 群組：5 (4+1) = 讀取和執行
- 其他人：5 (4+1) = 讀取和執行

3. 設定 Gitlab Runner

- 在 Gitlab 的專案中，找到 `Settings` -> `CI/CD` -> `Runners` -> `Set up a specific Runner manually`，並建立一個 Runner。

- 在 Server 上執行 `gitlab-runner register`，並填入相關資訊

```bash
sudo gitlab-runner register
```

- 設定 `token`

```bash
Please enter the gitlab-ci coordinator URL (e.g. https://gitlab.com/): // 輸入 Gitlab 的 URL
Please enter the gitlab-ci token for this runner: // 輸入 Gitlab 的 token
Please enter the gitlab-ci description for this runner: // 輸入 Runner 的描述
```

-

到這邊 Server 就有一個代理人可以執行 CI/CD 了。

### 2-2-3 設定 `.gitlab-ci.yml`

在專案根目錄建立 `.gitlab-ci.yml`，並設定好 CI/CD 流程。

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  tags:
    - my-runner // Runner 的名稱
  before_script:
    #如果需要身份驗證，或是其他程序，可以在這邊設定
    #也可以在這邊設定環境變數

    #複製 git
    - |
      if [! -d /opt/my-project]; then
        git clone https://gitlab.com/my-project.git /opt/my-project
      else
        if [ -d /opt/my-project/.git ]; then
        cd /opt/my-project & git pull
        else
        echo "Directory is not a git repository"
        fi
      fi

  script:
    - cd /opt/my-project // 切換到專案目錄
    - docker-compose build
  only:
    - master

deploy:
  stage: deploy
  script:
    - docker-compose up -d // 啟動服務
  only:
    - master
```

這樣就可以透過 Gitlab Runner 來自動化部署服務了。

```bash
git add .
git commit -m "Add .gitlab-ci.yml"
```

可以透過 `git push` 來觸發 CI/CD 流程。

## 結語

> 你可以幫我開一個 VM 嗎？我大概下午程式碼寫好就能推到測試站。

經過一個禮拜的努力，終於能脫離神手黨，有底氣可以講出這句話了。在這個過程中，稍微脫離的程式碼，也體驗到了『建立服務』是什麼感覺。
