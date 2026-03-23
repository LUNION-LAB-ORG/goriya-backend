# ================================================================================
# Stage 1: Builder - Compile avec toutes les dependances
# ================================================================================
FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json yarn.lock ./

# Installer TOUTES les dependances (y compris @nestjs/cli)
RUN yarn install --frozen-lockfile

# Copier le code source
COPY . .

# Build de l'application
RUN yarn build

# ================================================================================
# Stage 2: Production Dependencies - Installer uniquement les deps de prod
# ================================================================================
FROM node:22-alpine AS prod-deps

RUN corepack enable

WORKDIR /app

COPY package.json yarn.lock ./

# Installer uniquement les dépendances de production
RUN yarn install --frozen-lockfile --production=true

# ================================================================================
# Stage 3: Production - Image finale optimisée
# ================================================================================
FROM node:22-alpine AS production

# Installer outils runtime
RUN apk add --no-cache \
    netcat-openbsd \
    postgresql-client \
    dumb-init

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
