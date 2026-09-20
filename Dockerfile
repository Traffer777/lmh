# Базовый образ тянем через зеркало Docker Hub (mirror.gcr.io) — Timeweb сидит за
# общим NAT, и прямой Docker Hub регулярно отдаёт 429 (rate limit). Зеркало без лимита.
FROM mirror.gcr.io/library/node:24-slim

# Prisma's query engine needs OpenSSL at runtime on Debian-based images.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .
RUN npm ci
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
