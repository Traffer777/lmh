# Базовый образ через зеркало (mirror.gcr.io) — Timeweb за NAT, Docker Hub даёт 429.
# Multi-stage + отдельный слой для deps → npm ci кэшируется, пока package*.json не менялся.

# ---- 1. deps: только node_modules (кэшируется до правки package*.json)
FROM mirror.gcr.io/library/node:24-slim AS deps
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

# ---- 2. builder: собираем Next.js standalone
FROM mirror.gcr.io/library/node:24-slim AS builder
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Cache-bust: ENV меняет hash последующих COPY/RUN (комментарий этого не делает).
# Меняй значение при каждом принудительном пересборе.
ENV CACHEBUST=2026-09-21T15-25Z
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- 3. runner: минимальный runtime — только standalone + public + static
FROM mirror.gcr.io/library/node:24-slim AS runner
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "server.js"]
