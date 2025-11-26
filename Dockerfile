# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Docker Nginx를 통해 서빙될 때 API 요청이 Gateway Nginx의 /api/ 경로를 타도록 설정
# (apiClient.ts를 수정하지 않았다면 이 환경변수는 무시될 수 있음)
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html
# [추가됨] SPA 설정을 위한 Nginx 설정 파일 덮어쓰기
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]