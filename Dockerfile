FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
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
