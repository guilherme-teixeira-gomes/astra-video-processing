import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { AppDataSource } from "./database/data-source";
import { routes } from "./routes/routes";
import { connectRabbitMQ } from "./messaging/rabbitmq";
import { connectRedis } from "./services/redis";
import { register, httpRequests } from "./services/metrics";

export const app = express();
app.use(cors());
app.use(express.json());

// Métrica por requisição
app.use((req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    httpRequests.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.use(routes);
app.get("/health", (_req, res) => res.json({ status: "ok", service: "api-service" }));
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Tratamento de erros centralizado
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = /inválid|negado|não encontrado|já cadastrado|mínimo|ao menos/i.test(err.message) ? 400 : 500;
  res.status(status).json({ success: false, error: err.message });
});

const PORT = Number(process.env.PORT || 3000);

async function bootstrap() {
  await AppDataSource.initialize();
  await connectRabbitMQ();
  await connectRedis();
  app.listen(PORT, () => {
    console.log(JSON.stringify({ level: "info", message: "api-service iniciado", port: PORT }));
  });
}

if (require.main === module) {
  bootstrap().catch((err) => {
    console.error(JSON.stringify({ level: "error", message: "falha ao iniciar", error: err.message }));
    process.exit(1);
  });
}
