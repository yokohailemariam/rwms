# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifests first for layer caching
COPY package.json pnpm-lock.yaml prisma.config.ts ./
COPY prisma ./prisma/

# Install ALL deps (including dev for build)
# --ignore-scripts skips blocked postinstall scripts; native modules rebuilt explicitly below
RUN pnpm install --prefer-frozen-lockfile --ignore-scripts && \
    pnpm rebuild argon2 msgpackr-extract unrs-resolver

# Generate Prisma client
RUN pnpm prisma generate

# Copy source
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src/

# Build
RUN pnpm build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:22-alpine AS production

RUN apk add --no-cache openssl curl

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs

# Copy manifests
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install production deps only
RUN pnpm install --prefer-frozen-lockfile --prod --ignore-scripts && \
    pnpm rebuild argon2 msgpackr-extract unrs-resolver && \
    pnpm prisma generate && \
    pnpm store prune

# Copy built application
COPY --from=builder /app/dist ./dist/

# Own files by non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health/live || exit 1

CMD ["node", "dist/main"]
