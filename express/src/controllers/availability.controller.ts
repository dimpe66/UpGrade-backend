import { PrismaClient } from "@prisma/client";
import { addWeeks, isBefore } from "date-fns";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export const getAvailabilities = async (req: Request, res: Response) => {
  try {
    const availabilities = await prisma.tutorAvailability.findMany({
      where: { active: true },
      include: {
        tutor: { include: { tutorSubjects: { include: { subject: true } } } },
      },
    });
    res.json(availabilities);
  } catch {
    res.status(500).json({ error: "Error buscando disponibilidades" });
  }
};

export const createAvailability = async (req: Request, res: Response) => {
  try {
    const { tutorId, weekday, startTime, endTime, startDate, endDate } = req.body;
    const availability = await prisma.tutorAvailability.create({
      data: { tutorId, weekday, startTime, endTime, startDate, endDate },
    });

    const slots: any[] = [];
    let current = new Date(startDate);
    while (isBefore(current, new Date(endDate))) {
      if (current.getDay() === weekday) {
        slots.push({
          tutorId,
          date: current,
          startTime,
          endTime,
        });
        current = addWeeks(current, 1);
      } else {
        current.setDate(current.getDate() + 1);
      }
    }
    if (slots.length) await prisma.classSlot.createMany({ data: slots });

    res.status(201).json({ availability });
  } catch {
    res.status(500).json({ error: "Error creando disponibilidad" });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const { id, ...data } = req.body;
    const updated = await prisma.tutorAvailability.update({ where: { id: Number(id) }, data });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Error actualizando disponibilidad" });
  }
};

export const deleteAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await prisma.tutorAvailability.delete({ where: { id: Number(id) } });
    res.json({ message: "Disponibilidad eliminada" });
  } catch {
    res.status(500).json({ error: "Error eliminando disponibilidad" });
  }
};
