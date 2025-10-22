import { PrismaClient, SlotStatus } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { tutorId, subjectId, status } = req.query;
    const where: any = { deleted: false };
    if (tutorId) where.tutorId = Number(tutorId);
    if (subjectId) where.subjectId = Number(subjectId);
    if (status) where.status = status;

    const slots = await prisma.classSlot.findMany({
      where,
      orderBy: { date: "asc" },
    });
    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los módulos de clase" });
  }
};