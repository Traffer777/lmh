FROM node:24-slim

# Prisma's query engine needs OpenSSL at runtime on Debian-based images.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .
RUN npm ci
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
