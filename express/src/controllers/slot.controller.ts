import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export const getSlots = async (req: Request, res: Response) => {
  try {
    const { tutorId, status } = req.query;
    const where: any = { deleted: false };
    if (tutorId) where.tutorId = Number(tutorId);
    if (status) where.status = status;
    const slots = await prisma.classSlot.findMany({ where, include: { tutor: true }, orderBy: { date: "asc" } });
    res.json(slots);
  } catch {
    res.status(500).json({ error: "Error fetching slots" });
  }
};

export const createSlot = async (req: Request, res: Response) => {
  try {
    const { tutorId, date, startTime, endTime } = req.body;
    const slot = await prisma.classSlot.create({ data: { tutorId, date, startTime, endTime } });
    res.status(201).json(slot);
  } catch {
    res.status(500).json({ error: "Error creating slot" });
  }
};

export const updateSlot = async (req: Request, res: Response) => {
  try {
    const { id, ...data } = req.body;
    const slot = await prisma.classSlot.update({ where: { id: Number(id) }, data });
    res.json(slot);
  } catch {
    res.status(500).json({ error: "Error updating slot" });
  }
};

export const deleteSlot = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await prisma.classSlot.update({ where: { id: Number(id) }, data: { deleted: true } });
    res.json({ message: "Slot deleted" });
  } catch {
    res.status(500).json({ error: "Error deleting slot" });
  }
};
