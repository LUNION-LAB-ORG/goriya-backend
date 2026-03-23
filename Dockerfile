# ================================================================================
# Stage 1: Builder - Compile avec toutes les dépendances
# ================================================================================
FROM node:22-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer TOUTES les dépendances (y compris @nestjs/cli)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copier le code source
COPY . .

# Build de l'application
RUN pnpm run build

# ================================================================================
# Stage 2: Production Dependencies - Installer uniquement les deps de prod
# ================================================================================
FROM node:22-alpine AS prod-deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Installer uniquement les dépendances de production
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

# ================================================================================
# Stage 3: Production - Image finale optimisée
# ================================================================================
FROM node:22-alpine AS production

# Installer outils runtime
RUN apk add --no-cache \
    netcat-openbsd \
    postgresql-client \
    dumb-init

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Créer utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copier node_modules de production uniquement
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copier le code compilé
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copier package.json pour scripts npm
COPY --chown=nestjs:nodejs package.json ./

USER nestjs

EXPOSE 8081

ENV NODE_ENV=production
CMD ["node", "dist/main"]
