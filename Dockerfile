# multi-stage Dockerfile for Next.js (SSR)

# ----------------------------------------------------
# STAGE 1: BUILDER (Tạo ra các file build cuối cùng)
# ----------------------------------------------------
FROM node:18-alpine AS builder
WORKDIR /app

# Khắc phục lỗi SWC Binary (quan trọng)
# Buộc Next.js tải xuống các binary SWC cho môi trường Linux
ENV NEXT_SWC_FLAGS=-g
ENV NEXT_TELEMETRY_DISABLED=1

# 1. Cài đặt deps và copy source
COPY package*.json ./
# Dùng npm ci để cài đặt dependencies một cách sạch sẽ
RUN npm ci

# 2. Copy source và Build
COPY . .
# Chạy lệnh build (next build)
RUN npm run build

# ----------------------------------------------------
# STAGE 2: RUNNER (Môi trường Production tối giản)
# ----------------------------------------------------
FROM node:18-alpine AS runner
WORKDIR /app

# Khắc phục lỗi NODE_ENV (Bạn đang chạy next start)
ENV NODE_ENV=production
ENV PORT=3000

# 1. Cài đặt chỉ Production deps
COPY package*.json ./
RUN npm ci --only=production

# 2. Copy các file cần thiết từ BUILDER
# a) Build output (QUAN TRỌNG)
COPY --from=builder /app/.next ./.next
# b) Public files
COPY --from=builder /app/public ./public
# c) Cấu hình (next.config.js/mjs) và package.json
# Phải copy package.json để next start có thể tìm thấy script
COPY package.json ./
# Sửa lỗi next.config.mjs not found (vì nó nằm ở thư mục gốc)
COPY next.config.mjs ./next.config.mjs

EXPOSE 3000

# 3. Chạy ứng dụng Production
# Lỗi trước đó: Bạn dùng CMD ["npm", "run", "dev"] trong runner stage.
# Lệnh 'dev' chạy 'next dev' cho Development.
# Trong Production stage, bạn phải dùng lệnh 'start' để chạy 'next start'.
CMD ["npm", "run", "start"]