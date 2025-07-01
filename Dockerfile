# 多階段構建
# 第一階段：構建應用程式
FROM node:22-slim AS builder

# 安裝必要的系統依賴
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝 npm 依賴 (構建時需要所有依賴)
RUN npm ci

# 安裝 Playwright 和 Chromium（使用官方建議的方式）
RUN npx playwright install --with-deps chromium

# 複製所有源代碼
COPY . .

# 構建應用程式
RUN npm run build

# 第二階段：提供靜態文件服務
FROM nginx:alpine

# 複製自定義 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 從構建階段複製靜態文件到 nginx 目錄
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"] 