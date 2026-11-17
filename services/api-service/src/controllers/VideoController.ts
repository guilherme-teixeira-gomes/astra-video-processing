import { Request, Response } from "express";
import fs from "fs";
import { UploadVideoUseCase } from "../useCases/UploadVideoUseCase";
import { ListVideosUseCase } from "../useCases/ListVideosUseCase";
import { GetVideoUseCase } from "../useCases/GetVideoUseCase";

export class VideoController {
  async upload(req: Request, res: Response) {
    const userId = (req as any).userId;
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "Nenhum vídeo enviado (campo 'video')" });

    const video = await new UploadVideoUseCase().execute({
      userId,
      originalName: file.originalname,
      storagePath: file.path,
    });
    return res.status(201).json({ success: true, message: "Vídeo recebido e enfileirado para processamento", data: { id: video.id, status: video.status } });
  }

  async list(req: Request, res: Response) {
    const userId = (req as any).userId;
    const videos = await new ListVideosUseCase().execute(userId);
    return res.json({ success: true, data: videos });
  }

  async download(req: Request, res: Response) {
    const userId = (req as any).userId;
    const video = await new GetVideoUseCase().execute(req.params.id, userId);
    if (video.status !== "CONCLUIDO" || !video.zipPath) {
      return res.status(409).json({ error: `Vídeo ainda não processado (status: ${video.status})` });
    }
    if (!fs.existsSync(video.zipPath)) {
      return res.status(404).json({ error: "Arquivo zip não encontrado" });
    }
    return res.download(video.zipPath, `${video.originalName}.zip`);
  }
}
