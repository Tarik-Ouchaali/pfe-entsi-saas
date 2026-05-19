# ============================================================
#  ENTSI — Dockerfile Next.js (Node 20 Alpine)
#  Path: frontend-react/Dockerfile
# ============================================================

FROM node:20-alpine AS base

# ============================================================
# Stage 1 — Dependencies
# ============================================================
FROM base AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies (cache layer)
COPY package.json package-lock.json* ./
RUN npm ci

# ============================================================
# Stage 2 — Builder
# ============================================================
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args → env vars pour Next.js
ARG NEXT_PUBLIC_API_URL=http://laravel/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============================================================
# Stage 3 — Runner (image finale légère)
# ============================================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user (sécurité)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy build output
COPY --from=builder /app/public ./public

# Standalone output (next.config.js → output: 'standalone')
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]