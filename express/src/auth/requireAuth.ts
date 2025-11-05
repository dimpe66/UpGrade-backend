import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export interface AuthRequest extends Request { user?: { id: number } }

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No autorizado" });
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });
    req.user = { id: user.id };
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};
