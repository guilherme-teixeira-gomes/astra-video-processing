import { AppDataSource } from "../database/data-source";
import { Video } from "../entities/Video";

export class ListVideosUseCase {
  async execute(userId: string) {
    const repo = AppDataSource.getRepository(Video);
    const videos = await repo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
    return videos.map((v) => ({
      id: v.id,
      originalName: v.originalName,
      status: v.status,
      frameCount: v.frameCount,
      errorMessage: v.errorMessage,
      hasZip: !!v.zipPath,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
  }
}
