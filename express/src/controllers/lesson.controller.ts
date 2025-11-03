import { PrismaClient, LessonStatus, Modality, SlotStatus } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getLessons = async (req: Request, res: Response) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        tutor: true,
        student: true,
        subject: true,
        slot: true,
      },
      orderBy: { timestamp: "asc" },
    });
    res.json(lessons);
  } catch {
    res.status(500).json({ error: "Error al obtener las clases" });
  }
};

export const createLesson = async (req: Request, res: Response) => {
  try {
    const { studentId, tutorId, subjectId, modality, timestamp } = req.body;
    if (!studentId || !tutorId || !subjectId || !modality || !timestamp) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const slot = await prisma.classSlot.create({
      data: {
        tutorId,
        date: new Date(timestamp),
        startTime: new Date(timestamp).toISOString().slice(11, 16),
        endTime: "01:00",
        status: SlotStatus.RESERVED,
      },
    });

    const lesson = await prisma.lesson.create({
      data: {
        slotId: slot.id,
        studentId,
        tutorId,
        subjectId,
        modality: modality as Modality,
        timestamp: new Date(timestamp),
        status: LessonStatus.PENDING,
      },
      include: {
        tutor: true,
        student: true,
        subject: true,
        slot: true,
      },
    });

    res.status(201).json(lesson);
  } catch {
    res.status(500).json({ error: "Error al crear la clase" });
  }
};

export const updateLessonStatus = async (req: Request, res: Response) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ error: "Faltan campos" });

    const lesson = await prisma.lesson.update({
      where: { id: Number(id) },
      data: { status },
      include: { slot: true },
    });

    if (status === "CANCELLED") {
      await prisma.classSlot.update({
        where: { id: lesson.slotId },
        data: { status: SlotStatus.AVAILABLE },
      });
    }

    res.json(lesson);
  } catch {
    res.status(500).json({ error: "Error al actualizar el estado de la clase" });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Falta id" });
    await prisma.lesson.delete({ where: { id: Number(id) } });
    res.json({ message: "Clase eliminada" });
  } catch {
    res.status(500).json({ error: "Error al eliminar la clase" });
  }
};