import { AppDataSource } from "../database/data-source";
import { Video } from "../entities/Video";

export class GetVideoUseCase {
  async execute(videoId: string, userId: string) {
    const repo = AppDataSource.getRepository(Video);
    const video = await repo.findOne({ where: { id: videoId } });
    if (!video) throw new Error("Vídeo não encontrado");
    if (video.userId !== userId) throw new Error("Acesso negado");
    return video;
  }
}
