import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export interface AuthRequest extends Request {
  user?: { id: number };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Falta token de autorización" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.user = { id: decoded.userId };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
