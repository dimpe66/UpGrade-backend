import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../auth/requireAuth";

const prisma = new PrismaClient();

export const getUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, rating: true },
      orderBy: { firstName: "asc" },
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        rating: true,
        contactData: true,
        classroomAddress: true,
        onlineClassroomLink: true,
      },
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};
