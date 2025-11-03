import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, name } = req.query;
    const where: any = {};

    if (name) {
      where.OR = [
        { firstName: { contains: String(name), mode: "insensitive" } },
        { lastName: { contains: String(name), mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        tutorSubjects: {
          include: { subject: true },
        },
        tutorAvailabilities: true,
        lessonsAsTutor: true,
        lessonsAsStudent: true,
      },
      orderBy: { firstName: "asc" },
    });

    res.json(users);
  } catch {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, xpLevel, rating, profilePhoto } = req.body;
    if (!firstName || !lastName || !email) return res.status(400).json({ error: "Faltan campos requeridos" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "El email ya existe" });

    const user = await prisma.user.create({
      data: { firstName, lastName, email, xpLevel: xpLevel ?? 0, rating, profilePhoto },
    });

    res.status(201).json(user);
  } catch {
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id, firstName, lastName, email, xpLevel, rating, profilePhoto } = req.body;
    if (!id) return res.status(400).json({ error: "Falta id" });

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { firstName, lastName, email, xpLevel, rating, profilePhoto },
    });

    res.json(user);
  } catch {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Falta id" });

    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: "Usuario eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};