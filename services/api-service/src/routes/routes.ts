import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { AuthController } from "../controllers/AuthController";
import { VideoController } from "../controllers/VideoController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { videosUploaded } from "../services/metrics";

const routes = Router();
const authController = new AuthController();
const videoController = new VideoController();

// Armazenamento em volume/disco (PVC no k8s)
const UPLOAD_DIR = process.env.UPLOAD_DIR || "/data/uploads";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB

// Auth (públicas)
routes.post("/auth/register", (req, res) => authController.register(req, res));
routes.post("/auth/login", (req, res) => authController.login(req, res));

// Vídeos (protegidas)
routes.post("/videos", authMiddleware, upload.single("video"), (req, res) => {
  videosUploaded.inc();
  return videoController.upload(req, res);
});
routes.get("/videos", authMiddleware, (req, res) => videoController.list(req, res));
routes.get("/videos/:id/download", authMiddleware, (req, res) => videoController.download(req, res));

export { routes };
