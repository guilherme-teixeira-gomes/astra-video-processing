FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:20-alpine AS production
# FFmpeg é necessário para extrair os frames do vídeo
RUN apk add --no-cache ffmpeg
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/newrelic.js ./
RUN mkdir -p /data/uploads /data/outputs && chown -R appuser:appgroup /app /data
USER appuser
EXPOSE 3100
CMD ["node", "-r", "newrelic", "dist/server.js"]
