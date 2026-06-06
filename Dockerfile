FROM node:22-slim

WORKDIR /app

# CA certs + DNS — Alpine/Fly often break Discord gateway TLS without these
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy bot source (dashboard not needed on Fly)
COPY index.js ecosystem.config.cjs ./
COPY commands ./commands
COPY config ./config
COPY events ./events
COPY utils ./utils
COPY scripts ./scripts
COPY data ./data

ENV NODE_ENV=production
ENV START_LEGACY_DASHBOARD=false
ENV PORT=8080

CMD ["node", "index.js"]
