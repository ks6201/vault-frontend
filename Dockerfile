FROM oven/bun:1 AS deps
WORKDIR /app

COPY vault-frontend/package.json vault-frontend/bun.lock ./
COPY vault-sdk/packages/core ../vault-sdk/packages/core

RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /app

# Copy .env.production for build-time inlining of NEXT_PUBLIC_* vars
COPY vault-frontend/.env.production ./.env.production

COPY --from=deps /app/node_modules ./node_modules
COPY vault-frontend .
COPY vault-sdk/packages/core ../vault-sdk/packages/core

RUN bun run build

FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["bun", "run", "server.js"]
