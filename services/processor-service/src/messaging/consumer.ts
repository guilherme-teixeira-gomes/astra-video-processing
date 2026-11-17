import amqplib, { Channel } from "amqplib";
import { ProcessVideoUseCase } from "../useCases/ProcessVideoUseCase";
import { videosProcessed, videosError } from "../services/metrics";

const QUEUE = "video.process";
let connection: any = null;
let channel: Channel | null = null;

export async function startConsumer(): Promise<void> {
  const url = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
  connection = await amqplib.connect(url);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });

  // prefetch 1: cada réplica pega um job por vez — escala horizontal somando réplicas
  channel.prefetch(1);

  console.log(JSON.stringify({ level: "info", message: "processor consumindo a fila", queue: QUEUE }));

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;
    const job = JSON.parse(msg.content.toString());
    try {
      await new ProcessVideoUseCase().execute(job);
      videosProcessed.inc();
      channel!.ack(msg);
    } catch (err) {
      videosError.inc();
      console.error(JSON.stringify({ level: "error", message: "erro no processamento", error: (err as Error).message }));
      // nack sem requeue — o status já foi gravado como ERRO
      channel!.nack(msg, false, false);
    }
  });
}
