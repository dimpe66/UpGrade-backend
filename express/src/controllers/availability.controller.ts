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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener disponibilidad" });
  }
};

export const createAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const tutorId = req.user!.id;
    const { weekdays, timeBlocks } = req.body;

    if (!Array.isArray(weekdays) || !Array.isArray(timeBlocks))
      return res
        .status(400)
        .json({ error: "weekdays y timeBlocks deben ser arrays" });

    const created = await prisma.tutorAvailability.create({
      data: {
        tutorId,
        weekdays: weekdays as any,
        timeBlocks: timeBlocks as any,
        active: true,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear disponibilidad" });
  }
};

export const deleteAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const tutorId = req.user!.id;
    const { id } = req.body;

    if (!id) return res.status(400).json({ error: "Falta el ID de la disponibilidad" });

    const availability = await prisma.tutorAvailability.findFirst({
      where: { id: Number(id), tutorId },
    });

    if (!availability)
      return res.status(404).json({ error: "Disponibilidad no encontrada" });

    await prisma.tutorAvailability.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Disponibilidad eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar disponibilidad" });
  }
};
