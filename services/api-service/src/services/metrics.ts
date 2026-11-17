import client from "prom-client";

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequests = new client.Counter({
  name: "astra_http_requests_total",
  help: "Total de requisições HTTP",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

export const videosUploaded = new client.Counter({
  name: "astra_videos_uploaded_total",
  help: "Total de vídeos enviados para processamento",
  registers: [register],
});
