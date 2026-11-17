import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Token não fornecido" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token inválido" });

  try {
    const secret = process.env.JWT_SECRET || "fiapx-secret";
    const decoded = jwt.verify(token, secret) as { sub: string; email: string; name: string };
    (req as any).userId = decoded.sub;
    (req as any).userEmail = decoded.email;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
