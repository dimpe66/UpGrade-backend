import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedUser {
  sub: string;
  email: string;
  firstName?: string;
  lastName?: string;
}
export interface AuthedRequest extends Request {
  user?: AuthedUser;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Falta token" });
  }
  const token = header.substring("Bearer ".length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthedUser;
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}
