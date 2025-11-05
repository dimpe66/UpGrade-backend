import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../auth/requireAuth";

const prisma = new PrismaClient();

export const getAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const tutorId = req.user!.id;
    const data = await prisma.tutorAvailability.findMany({
      where: { tutorId, active: true },
      orderBy: { id: "asc" },
    });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener disponibilidad" });
  }
};

export const createAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const tutorId = req.user!.id;
    const { weekdays, timeBlocks } = req.body;
    if (!Array.isArray(weekdays) || !Array.isArray(timeBlocks)) return res.status(400).json({ error: "weekdays y timeBlocks deben ser arrays" });
    const created = await prisma.tutorAvailability.create({ data: { tutorId, weekdays, timeBlocks } });
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Error al crear disponibilidad" });
  }
};
