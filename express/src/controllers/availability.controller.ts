import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getAvailabilities = async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.query;
    const where: any = {};
    if (tutorId) where.tutorId = Number(tutorId);

    const availabilities = await prisma.tutorAvailability.findMany({
      where,
      include: { tutor: true },
      orderBy: { weekday: "asc" },
    });

    res.json(availabilities);
  } catch {
    res.status(500).json({ error: "Error al obtener disponibilidades" });
  }
};

export const createAvailability = async (req: Request, res: Response) => {
  try {
    const { tutorId, weekday, startTime, endTime, startDate, endDate } = req.body;
    if (!tutorId || weekday === undefined || !startTime || !endTime || !startDate || !endDate) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const availability = await prisma.tutorAvailability.create({
      data: {
        tutorId,
        weekday,
        startTime,
        endTime,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        active: true,
      },
    });

    res.status(201).json(availability);
  } catch {
    res.status(500).json({ error: "Error al crear disponibilidad" });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const { id, weekday, startTime, endTime, startDate, endDate, active } = req.body;
    if (!id) return res.status(400).json({ error: "Falta id" });

    const availability = await prisma.tutorAvailability.update({
      where: { id: Number(id) },
      data: {
        weekday,
        startTime,
        endTime,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        active,
      },
    });

    res.json(availability);
  } catch {
    res.status(500).json({ error: "Error al actualizar disponibilidad" });
  }
};

export const deleteAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Falta id" });

    await prisma.tutorAvailability.delete({ where: { id: Number(id) } });
    res.json({ message: "Disponibilidad eliminada" });
  } catch {
    res.status(500).json({ error: "Error al eliminar disponibilidad" });
  }
};
