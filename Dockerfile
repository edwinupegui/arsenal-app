# Dockerfile para arsenal-app
# Usando Node.js 22 LTS para mejor soporte de SQLite/better-sqlite3

FROM node:22-alpine AS base
WORKDIR /app

# Instalar dependencias del sistema para better-sqlite3
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite

# Deps stage - solo instala producción
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Build stage - instala todo y compila
FROM deps AS builder
COPY . .
RUN npm install && npm run build

# Production stage - imagen minimalista
FROM base AS production
WORKDIR /app

# Copiar solo lo necesario
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Crear directorio para la base de datos
RUN mkdir -p /app/data

# Usar variable de entorno o valor por defecto
ENV DATABASE_URL=/app/data/resources.db
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser
USER appuser

CMD ["node", "./dist/server/entry.mjs"]