# Docker 部署指南

本文檔說明如何使用 Docker 來運行 Sam 的開發博客。

## 快速開始

### 生產環境部署

構建並運行生產環境：

```bash
# 構建並啟動生產環境
docker-compose up -d sam-blog-prod

# 或者使用簡化命令
docker-compose up -d
```

網站將在 http://localhost 上運行。

## 詳細說明

### 服務說明

- **sam-blog-prod**: 生產環境，使用 Nginx 提供靜態文件服務

### 端口配置

- 生產環境: `80:80`

### 健康檢查

生產環境包含健康檢查功能，可以通過以下端點檢查服務狀態：

```bash
curl http://localhost/health
```

### Docker 命令

#### 構建映像

```bash
# 僅構建映像
docker-compose build sam-blog-prod
```

#### 查看日誌

```bash
# 查看生產環境日誌
docker-compose logs sam-blog-prod

# 跟蹤日誌
docker-compose logs -f sam-blog-prod
```

#### 停止服務

```bash
# 停止所有服務
docker-compose down

# 停止並移除 volumes
docker-compose down -v
```

#### 重新構建

```bash
# 強制重新構建並啟動
docker-compose up -d --build sam-blog-prod
```

## 故障排除

### 常見問題

1. **端口被佔用**

   ```bash
   # 檢查端口使用情況
   lsof -i :80
   # 或者修改 docker-compose.yml 中的端口映射
   ```

2. **構建失敗**

   ```bash
   # 清理 Docker 緩存
   docker system prune -a
   ```

3. **依賴安裝問題**
   ```bash
   # 清理 node_modules volume
   docker-compose down -v
   docker-compose up -d --build
   ```

## 性能優化

### Nginx 配置

已配置的優化包括：

- Gzip 壓縮
- 靜態資源緩存（1 年）
- HTML 文件緩存（1 小時）
- 安全標頭

### Docker 映像優化

- 使用多階段構建減小映像大小
- 使用 Alpine Linux 基底映像
- 優化的 .dockerignore 文件

## 生產部署建議

1. **環境變數**: 創建 `.env` 文件來管理環境變數
2. **SSL/HTTPS**: 在生產環境中配置反向代理（如 Traefik 或 Nginx）
3. **日誌管理**: 配置日誌聚合和監控
4. **自動備份**: 設置定期備份策略
5. **監控**: 配置健康檢查和監控系統

## 相關文件

- `Dockerfile`: 多階段構建配置
- `docker-compose.yml`: 服務編排配置
- `nginx.conf`: Nginx 伺服器配置
- `.dockerignore`: Docker 構建忽略文件
