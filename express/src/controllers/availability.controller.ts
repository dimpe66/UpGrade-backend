import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../auth/requireAuth";

const prisma = new PrismaClient();

export const getAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const tutorId = req.user!.id;
    const availabilities = await prisma.tutorAvailability.findMany({
      where: { tutorId, active: true },
      orderBy: { weekday: "asc" },
    });
    res.json(availabilities);
  } catch {
    res.status(500).json({ error: "Error al obtener disponibilidad" });
  }
};

export const createAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const tutorId = req.user!.id;
    const { weekday, startTime, endTime, startDate, endDate } = req.body;
    const availability = await prisma.tutorAvailability.create({
      data: { tutorId, weekday, startTime, endTime, startDate, endDate },
    });
    res.status(201).json(availability);
  } catch {
    res.status(500).json({ error: "Error al crear disponibilidad" });
  }
};
