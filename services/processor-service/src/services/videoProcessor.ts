import ffmpeg from "fluent-ffmpeg";
import archiver from "archiver";
import fs from "fs";
import path from "path";

/**
 * Extrai frames de um vídeo (1 frame por segundo) e os compacta num .zip.
 * Retorna o caminho do zip e a quantidade de frames gerados.
 */
export class VideoProcessor {
  async process(videoPath: string, videoId: string): Promise<{ zipPath: string; frameCount: number }> {
    const outputBase = process.env.OUTPUT_DIR || "/data/outputs";
    const framesDir = path.join(outputBase, videoId, "frames");
    fs.mkdirSync(framesDir, { recursive: true });

    // 1. Extrai os frames com FFmpeg (1 fps)
    await this.extractFrames(videoPath, framesDir);

    const frames = fs.readdirSync(framesDir).filter((f) => f.endsWith(".png"));
    if (frames.length === 0) {
      throw new Error("Nenhum frame extraído — vídeo inválido ou corrompido");
    }

    // 2. Compacta os frames num zip
    const zipPath = path.join(outputBase, videoId, "frames.zip");
    await this.zipFrames(framesDir, zipPath);

    return { zipPath, frameCount: frames.length };
  }

  private extractFrames(videoPath: string, framesDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions(["-vf", "fps=1"]) // 1 frame por segundo
        .output(path.join(framesDir, "frame-%04d.png"))
        .on("end", () => resolve())
        .on("error", (err) => reject(new Error("Falha ao extrair frames: " + err.message)))
        .run();
    });
  }

  private zipFrames(framesDir: string, zipPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });
      output.on("close", () => resolve());
      archive.on("error", (err) => reject(err));
      archive.pipe(output);
      archive.directory(framesDir, false);
      archive.finalize();
    });
  }
}
