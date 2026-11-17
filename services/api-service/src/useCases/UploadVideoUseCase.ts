import { AppDataSource } from "../database/data-source";
import { Video } from "../entities/Video";
import { publishVideoJob } from "../messaging/rabbitmq";
import { cacheStatus } from "../services/redis";

export class UploadVideoUseCase {
  async execute(input: { userId: string; originalName: string; storagePath: string }) {
    const repo = AppDataSource.getRepository(Video);

    const video = repo.create({
      userId: input.userId,
      originalName: input.originalName,
      storagePath: input.storagePath,
      status: "NA_FILA",
    });
    const saved = await repo.save(video);

    await cacheStatus(saved.id, "NA_FILA");

    // Publica o job na fila — o Processor Service consome e processa.
    // A fila durável garante que o pico não perca a requisição.
    await publishVideoJob({
      videoId: saved.id,
      userId: input.userId,
      storagePath: input.storagePath,
      originalName: input.originalName,
    });

    return saved;
  }
}
