import { PrismaClient, LessonStatus, Modality, SlotStatus } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../auth/requireAuth";
import { startOfDay } from "date-fns";

const prisma = new PrismaClient();
const XP_REWARD = 50; 

export const getLessons = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { includePast } = req.query;
    const now = startOfDay(new Date());

    const lessons = await prisma.lesson.findMany({
      where: {
        OR: [{ tutorId: userId }, { studentId: userId }],
        status: LessonStatus.PENDING,
        ...(includePast ? {} : { timestamp: { gte: now } }),
      },
      include: { tutor: true, student: true, subject: true, slot: true },
      orderBy: { timestamp: "asc" },
    });

    res.json(lessons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las clases" });
  }
};

export const createLesson = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { slotId, subjectId, modality } = req.body;

    if (!slotId || !subjectId || !modality)
      return res.status(400).json({ error: "Datos incompletos" });

    const slot = await prisma.classSlot.findUnique({ where: { id: Number(slotId) } });
    if (!slot || slot.status !== SlotStatus.AVAILABLE)
      return res.status(400).json({ error: "El cupo no está disponible" });

    if (slot.tutorId === studentId)
      return res.status(400).json({ error: "No podés reservar una clase con vos mismo." });

    const existingLesson = await prisma.lesson.findFirst({
      where: {
        slotId: slot.id,
        status: { in: [LessonStatus.PENDING] },
      },
    });
    if (existingLesson)
      return res.status(400).json({ error: "Ya existe una clase activa para este cupo" });

    const lesson = await prisma.lesson.create({
      data: {
        slotId: slot.id,
        studentId,
        tutorId: slot.tutorId,
        subjectId: Number(subjectId),
        modality: modality as Modality,
        timestamp: slot.date,
        status: LessonStatus.PENDING,
      },
      include: { tutor: true, student: true, subject: true, slot: true },
    });

    await prisma.classSlot.update({
      where: { id: slot.id },
      data: { status: SlotStatus.RESERVED, reservedById: studentId },
    });

    await prisma.user.updateMany({
      where: { id: { in: [studentId, slot.tutorId] } },
      data: { xpLevel: { increment: XP_REWARD } },
    });

    res.status(201).json({
      message: `Clase reservada con éxito (+${XP_REWARD} XP para ambos)`,
      lesson,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la clase" });
  }
};

export const cancelLesson = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { lessonId } = req.body;

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        OR: [{ studentId: userId }, { tutorId: userId }],
      },
      include: { slot: true },
    });

    if (!lesson) return res.status(404).json({ error: "Clase no encontrada" });
    if (lesson.status === LessonStatus.CANCELLED)
      return res.status(400).json({ error: "La clase ya estaba cancelada" });


    await prisma.lesson.update({
      where: { id: lessonId },
      data: { status: LessonStatus.CANCELLED },
    });

    await prisma.classSlot.update({
      where: { id: lesson.slotId },
      data: { status: SlotStatus.AVAILABLE, reservedById: null },
    });

    if (lesson.status === LessonStatus.PENDING) {
      await prisma.user.updateMany({
        where: { id: { in: [lesson.studentId, lesson.tutorId] } },
        data: { xpLevel: { decrement: XP_REWARD } },
      });
    }

    res.json({
      message: `Clase cancelada correctamente (-${XP_REWARD} XP para ambos)`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cancelar la clase" });
  }
};
