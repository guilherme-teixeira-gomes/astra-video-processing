import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./database/data-source";
import { startConsumer } from "./messaging/consumer";
import { register } from "./services/metrics";

const app = express();
app.get("/health", (_req, res) => res.json({ status: "ok", service: "processor-service" }));
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

const PORT = Number(process.env.PORT || 3100);

async function bootstrap() {
  await AppDataSource.initialize();
  await startConsumer();
  app.listen(PORT, () => {
    console.log(JSON.stringify({ level: "info", message: "processor-service iniciado", port: PORT }));
  });
}

if (require.main === module) {
  bootstrap().catch((err) => {
    console.error(JSON.stringify({ level: "error", message: "falha ao iniciar", error: err.message }));
    process.exit(1);
  });
}
