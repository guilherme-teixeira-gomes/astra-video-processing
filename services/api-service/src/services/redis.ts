import Redis from "ioredis";

/**
 * Cache Redis para status dos vídeos — consultas rápidas sem bater no Postgres.
 */
export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT || 6379),
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

export async function connectRedis() {
  try {
    await redis.connect();
  } catch (e) {
    // cache é best-effort; se o Redis cair, a API continua lendo do Postgres
    console.error(JSON.stringify({ level: "warn", message: "redis indisponivel", error: (e as Error).message }));
  }
}

export async function cacheStatus(videoId: string, status: string) {
  try { await redis.set(`video:${videoId}:status`, status, "EX", 3600); } catch {}
}

export async function getCachedStatus(videoId: string): Promise<string | null> {
  try { return await redis.get(`video:${videoId}:status`); } catch { return null; }
}
