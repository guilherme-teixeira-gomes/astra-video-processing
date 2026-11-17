import { AppDataSource } from "../database/data-source";
import { Video } from "../entities/Video";
import { User } from "../entities/User";
import { VideoProcessor } from "../services/videoProcessor";
import { notifyError } from "../services/mailer";

interface Job {
  videoId: string;
  userId: string;
  storagePath: string;
  originalName: string;
}

/**
 * Orquestra o processamento de um vídeo:
 * NA_FILA -> PROCESSANDO -> CONCLUIDO (ou ERRO + notificação por email)
 */
export class ProcessVideoUseCase {
  constructor(private processor = new VideoProcessor()) {}

  async execute(job: Job): Promise<void> {
    const repo = AppDataSource.getRepository(Video);
    const video = await repo.findOne({ where: { id: job.videoId } });
    if (!video) return; // vídeo não existe mais, ignora

    try {
      video.status = "PROCESSANDO";
      await repo.save(video);

      const { zipPath, frameCount } = await this.processor.process(job.storagePath, job.videoId);

      video.status = "CONCLUIDO";
      video.zipPath = zipPath;
      video.frameCount = frameCount;
      video.errorMessage = null as any;
      await repo.save(video);
    } catch (err) {
      const reason = (err as Error).message;
      video.status = "ERRO";
      video.errorMessage = reason;
      await repo.save(video);

      // Notifica o usuário por email
      try {
        const user = await AppDataSource.getRepository(User).findOne({ where: { id: job.userId } });
        if (user?.email) await notifyError(user.email, job.originalName, reason);
      } catch { /* email é best-effort */ }
    }
  }
}
