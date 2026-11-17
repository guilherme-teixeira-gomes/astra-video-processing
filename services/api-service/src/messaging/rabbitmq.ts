import amqplib, { Channel } from "amqplib";

const QUEUE = "video.process";
let connection: any = null;
let channel: Channel | null = null;

export async function connectRabbitMQ(): Promise<Channel> {
  if (channel) return channel;
  const url = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
  connection = await amqplib.connect(url);
  channel = await connection.createChannel();
  // fila durável: mensagens sobrevivem a reinício do broker (não perde requisição)
  await channel.assertQueue(QUEUE, { durable: true });
  return channel;
}

export async function publishVideoJob(payload: object): Promise<void> {
  const ch = await connectRabbitMQ();
  ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)), { persistent: true });
}

export { QUEUE };
