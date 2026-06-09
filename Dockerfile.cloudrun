# syntax=docker/dockerfile:1

# ── Stage 1: Build the Vite SPA ──────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Only non-secret config — NO API keys at build time
ARG LLM_PROVIDER=openai
ARG LLM_MODEL=gpt-4o-mini
ARG LLM_PROXY_URL=""

RUN echo "LLM_PROVIDER=${LLM_PROVIDER}" > .env && \
    echo "LLM_MODEL=${LLM_MODEL}" >> .env && \
    echo "LLM_PROXY_URL=${LLM_PROXY_URL}" >> .env

RUN npm run build

# ── Stage 2: Node.js server with API proxy ───────────────────────────
FROM node:20-alpine
WORKDIR /app

# Install production server dependencies
RUN npm init -y && \
    npm pkg set type=module && \
    npm install express@4 http-proxy-middleware@2 compression && \
    rm -rf /root/.npm

# Copy built assets and server with correct ownership
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node server.js ./

# Run as non-root
USER node

# Cloud Run sets PORT (default 8080)
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
