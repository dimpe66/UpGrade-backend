import { PrismaClient, SlotStatus } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../auth/requireAuth";

const prisma = new PrismaClient();

export const getSlots = async (req: AuthRequest, res: Response) => {
  try {
    const tutorId = req.user!.id;
    const slots = await prisma.classSlot.findMany({
      where: { tutorId },
      orderBy: { date: "asc" },
    });
    res.json(slots);
  } catch {
    res.status(500).json({ error: "Error al obtener slots" });
  }
};

export const createSlot = async (req: AuthRequest, res: Response) => {
  try {
    const tutorId = req.user!.id;
    const { date, startTime, endTime } = req.body;
    const slot = await prisma.classSlot.create({
      data: { tutorId, date, startTime, endTime, status: SlotStatus.AVAILABLE },
    });
    res.status(201).json(slot);
  } catch {
    res.status(500).json({ error: "Error al crear slot" });
  }
};
