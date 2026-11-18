
# Etapa 1: instalar dependencias y compilar
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Etapa 2: preparar las dependencias de producción
FROM node:22-bookworm-slim AS production-deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# Etapa 3: ejecutar el backend
FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/main.js"]
