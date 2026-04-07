---
title: 【Security】前端專案 DevSecOps 弱點掃描與 CI/CD 整合指南
tags: ["Security", "Web Security"]
sidebar_label: 【Security】前端專案 DevSecOps 弱點掃描與 CI/CD 整合指南
sidebar_position: 0
---

# 前端專案 DevSecOps 弱點掃描與 CI/CD 整合指南

這份指南針對前端專案（如：Angular 應用），提供涵蓋原始碼、依賴套件、容器至動態運行的完整弱點掃描架構，並以私有雲環境下的 GitLab CI/CD 整合為例，協助專案符合 ISO 27001 等資安稽核規範。

## 1. 核心掃描工具與映像檔清單

建構完整的 DevSecOps 流線，需要搭配不同的工具來負責不同維度的掃描：

| 掃描維度            | 核心 Image / 元件                      | 官方文件與說明                                                                                                                                                   |
| :------------------ | :------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SAST (靜態掃描)** | `sonarsource/sonar-scanner-cli:latest` | [SonarScanner CLI Docs](https://docs.sonarsource.com/sonarqube-server/latest/analyzing-source-code/scanners/sonarscanner/)<br>執行程式碼品質與安全性分析。       |
| **中央控管平台**    | `sonarqube:26.3...-community`          | [SonarQube Community Docs](https://docs.sonarsource.com/sonarqube-community-build/)<br>接收報告並視覺化呈現品質門檻 (Quality Gates)。                            |
| **SCA (依賴掃描)**  | `owasp/dependency-check:latest`        | [Dependency-Check Wiki](https://jeremylong.github.io/DependencyCheck/index.html)<br>掃描 `package.json` 中的第三方套件漏洞 (CVE)。                               |
| **報表整合外掛**    | `dependency-check-sonar-plugin`        | [Plugin Releases](https://github.com/dependency-check/dependency-check-sonar-plugin/releases)<br>安裝於 SonarQube Server，將前述 XML 報表轉化為面板上的 Issues。 |
| **容器與 OS 掃描**  | `aquasec/trivy:latest`                 | [Trivy Documentation](https://aquasecurity.github.io/trivy/)<br>極速掃描打包好的 Docker Image 及其 OS 系統層漏洞。                                               |
| **DAST (動態掃描)** | `zaproxy/zap-stable:latest`            | [OWASP ZAP Docker Docs](https://www.zaproxy.org/docs/docker/)<br>模擬駭客攻擊，掃描運作中網站的設定與邏輯漏洞。                                                  |

## 2. 多層次防禦矩陣 (掃描重點)

為了因應 ISO 27001 稽核（特別是 A.8.8 與 A.8.28），防禦必須涵蓋應用程式生命週期的各個階段：

1. **自定義程式碼層 (SonarQube)：** 揪出不安全的寫法（如 XSS、CSRF）、寫死在前端的機密資訊 (Hardcoded Secrets)、以及技術債。
2. **第三方開源套件層 (Dependency-Check)：** 防禦供應鏈攻擊，抓出含有已知 CVE 漏洞的舊版套件（針對老舊專案，此項通常會報出大量風險）。
3. **基礎設施與容器層 (Trivy)：** 確保用來打包前端的 Base Image（如 `node:alpine` 或 `nginx`）沒有作業系統層級的高危險漏洞。
4. **動態運行層 (OWASP ZAP)：** 確保伺服器 HTTP Headers 設定正確、Cookie 安全性 (`HttpOnly`, `Secure`) 無虞，並防止伺服器資訊外洩。

### 🛡️ 針對舊專案的 ISO 27001 稽核應對策略

對於歷史悠久的專案，掃描出大量無法立刻升級的漏洞是正常的。稽核的重點在於**流程管控**：

- **制定修補 SLA：** 規範 Critical 與 High 級別漏洞的修補期限。
- **補償性控制 (Compensating Controls)：** 若套件無法升級，需證明已採取其他防護（如架設 WAF 防火牆、限制內網存取）。
- **風險接受 (Risk Acceptance)：** 針對無法修復且有補償措施的漏洞，需產出清單並由管理階層簽核接受風險。

---

## 3. 私有雲 GitLab CI 整合設定

以下展示在私有雲環境中，如何透過 GitLab Runner 結合上述工具建構完整的 Pipeline。

### 3.1 Server 端啟動 (Docker Compose)

_部署於私有雲主機，提供 SonarQube 服務。請預先下載 Dependency-Check Plugin 放入 `extensions/plugins`。_

```yaml
version: "3.8"
services:
  sonarqube:
    image: sonarqube:26.3.0.120487-community
    ports:
      - "9000:9000"
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
      # 加入資料庫連線設定
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions # Plugin 放這裡
      - sonarqube_logs:/opt/sonarqube/logs
```

### 3.2 掃描流程 ( `.gitlab-ci.yml` 範例)

_此流程將依次執行：SCA 產出報告 -> SAST 帶入報告 -> 建立 Image -> Trivy 掃描 -> 啟動測試環境 -> ZAP 動態掃描。_

```yaml
stages:
  - test_code # 靜態與依賴掃描
  - package # 打包與容器掃描
  - deploy_test # 部署至測試環境
  - dast_scan # 動態掃描

variables:
  SONAR_USER_HOME: "${CI_PROJECT_DIR}/.sonar"
  GIT_DEPTH: "0"

# 1. 執行 Dependency-Check 產生 XML 報告 (不在此階段上傳 Sonar)
dependency_check:
  stage: test_code
  image:
    name: owasp/dependency-check:latest
    entrypoint: [""]
  script:
    - /usr/share/dependency-check/bin/dependency-check.sh --project "MyAngularApp" --scan ./ --format "XML" --out target/dependency-check-report.xml
  artifacts:
    paths:
      - target/dependency-check-report.xml
    expire_in: 1 day

# 2. 執行 SonarScanner，並帶入上一步的 SCA 報告
sonarqube_check:
  stage: test_code
  needs: [dependency_check]
  image:
    name: sonarsource/sonar-scanner-cli:latest
    entrypoint: [""]
  cache:
    key: "${CI_JOB_NAME}"
    paths:
      - .sonar/cache
  script:
    - sonar-scanner \
      -Dsonar.projectKey=my_angular_app \
      -Dsonar.sources=src \
      -Dsonar.host.url=$SONAR_HOST_URL \
      -Dsonar.token=$SONAR_TOKEN \
      -Dsonar.dependencyCheck.xmlReportPath=target/dependency-check-report.xml

# 3. Trivy 掃描打包好的 Docker Image
container_scanning:
  stage: package
  # 假設此階段前已執行 docker build -t my-frontend-app:latest .
  image:
    name: aquasec/trivy:latest
    entrypoint: [""]
  variables:
    TRIVY_CACHE_DIR: ".trivycache/"
  cache:
    key: trivy-cache
    paths:
      - .trivycache/
  script:
    # 發現 HIGH 或 CRITICAL 漏洞即中斷 Pipeline (exit code 1)
    - trivy image --exit-code 1 --severity HIGH,CRITICAL my-frontend-app:latest

# 4. OWASP ZAP 動態掃描 (針對測試環境)
zap_baseline_scan:
  stage: dast_scan
  # 假設此階段前，已將 Image 部署至測試機 $STAGING_URL
  image:
    name: zaproxy/zap-stable:latest
    entrypoint: [""]
  script:
    - mkdir -p /zap/wrk
    # 執行 Baseline 掃描，-I 代表產生警告但不中斷 Pipeline
    - zap-baseline.py -t $STAGING_URL -r zap-report.html -I
  artifacts:
    when: always
    paths:
      - /zap/wrk/zap-report.html
    expire_in: 7 days
```
