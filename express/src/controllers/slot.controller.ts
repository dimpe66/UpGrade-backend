import { PrismaClient, SlotStatus } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getSlots = async (req: Request, res: Response) => {
  try {
    const { tutorId, status } = req.query;
    const where: any = { deleted: false };
    if (tutorId) where.tutorId = Number(tutorId);
    if (status) where.status = status;

    const slots = await prisma.classSlot.findMany({
      where,
      include: {
        tutor: true,
        reservedBy: true,
        lesson: true,
      },
      orderBy: { date: "asc" },
    });

    res.json(slots);
  } catch {
    res.status(500).json({ error: "Error al obtener los módulos de clase" });
  }
};

export const createSlot = async (req: Request, res: Response) => {
  try {
    const { tutorId, date, startTime, endTime } = req.body;
    if (!tutorId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const slot = await prisma.classSlot.create({
      data: {
        tutorId,
        date: new Date(date),
        startTime,
        endTime,
        status: SlotStatus.AVAILABLE,
        deleted: false,
      },
    });

    res.status(201).json(slot);
  } catch {
    res.status(500).json({ error: "Error al crear el módulo de clase" });
  }
};

export const updateSlot = async (req: Request, res: Response) => {
  try {
    const { id, date, startTime, endTime, status, deleted } = req.body;
    if (!id) return res.status(400).json({ error: "Falta id" });

    const slot = await prisma.classSlot.update({
      where: { id: Number(id) },
      data: {
        date: date ? new Date(date) : undefined,
        startTime,
        endTime,
        status,
        deleted,
      },
    });

    res.json(slot);
  } catch {
    res.status(500).json({ error: "Error al actualizar el módulo de clase" });
  }
};

export const deleteSlot = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Falta id" });

    await prisma.classSlot.delete({ where: { id: Number(id) } });
    res.json({ message: "Módulo eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar el módulo de clase" });
  }
};
