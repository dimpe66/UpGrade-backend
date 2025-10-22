import { PrismaClient, LessonStatus, SlotStatus } from "@prisma/client";
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
    });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: "Error fetching lessons" });
  }
};

export const createLesson = async (req: Request, res: Response) => {
  try {
    const { slotId, studentId, tutorId, subjectId, modality, timestamp } = req.body;

    if (!slotId || !studentId || !tutorId || !subjectId || !modality || !timestamp) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const slot = await prisma.classSlot.findUnique({ where: { id: slotId } });
    if (!slot || slot.status !== SlotStatus.AVAILABLE) {
      return res.status(400).json({ error: "Slot not available" });
    }

    const lesson = await prisma.lesson.create({
      data: {
        slotId,
        studentId,
        tutorId,
        subjectId,
        modality,
        timestamp,
        status: LessonStatus.PENDING,
      },
    });

    await prisma.classSlot.update({
      where: { id: slotId },
      data: {
        status: SlotStatus.RESERVED,
        reservedById: studentId,
        subjectId,
      },
    });

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ error: "Error creating lesson" });
  }
};
