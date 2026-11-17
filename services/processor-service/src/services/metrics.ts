import client from "prom-client";

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const videosProcessed = new client.Counter({
  name: "astra_videos_processed_total",
  help: "Total de vídeos processados com sucesso",
  registers: [register],
});

export const videosError = new client.Counter({
  name: "astra_videos_error_total",
  help: "Total de vídeos com erro no processamento",
  registers: [register],
});
