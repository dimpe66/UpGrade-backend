import { PrismaClient, LessonStatus, SlotStatus, Modality } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../auth/requireAuth";

const prisma = new PrismaClient();

export const getLessons = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const lessons = await prisma.lesson.findMany({
      where: { OR: [{ studentId: userId }, { tutorId: userId }] },
      include: { tutor: true, student: true, subject: true, slot: true },
      orderBy: { timestamp: "asc" },
    });
    res.json(lessons);
  } catch {
    res.status(500).json({ error: "Error al obtener lecciones" });
  }
};

export const createLesson = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { slotId, tutorId, subjectId, modality } = req.body;

    const slot = await prisma.classSlot.findUnique({ where: { id: Number(slotId) } });
    if (!slot || slot.status !== SlotStatus.AVAILABLE)
      return res.status(400).json({ error: "El horario no está disponible" });

    await prisma.classSlot.update({
      where: { id: slot.id },
      data: { status: SlotStatus.RESERVED, reservedById: studentId },
    });

    const lesson = await prisma.lesson.create({
      data: {
        slotId: slot.id,
        studentId,
        tutorId,
        subjectId,
        modality: modality as Modality,
        timestamp: slot.date,
        status: LessonStatus.PENDING,
      },
    });

    res.status(201).json(lesson);
  } catch {
    res.status(500).json({ error: "Error al crear lección" });
  }
};
