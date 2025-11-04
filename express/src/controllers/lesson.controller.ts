import { PrismaClient, LessonStatus, SlotStatus } from "@prisma/client";
import { Request, Response } from "express";
import { AuthedRequest } from "../auth/requireAuth";

const prisma = new PrismaClient();

export const getLessons = async (req: Request, res: Response) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: { tutor: true, student: true, subject: true, slot: true },
      orderBy: { timestamp: "asc" },
    });
    res.json(lessons);
  } catch {
    res.status(500).json({ error: "Error fetching lessons" });
  }
};

export const createLesson = async (req: AuthedRequest, res: Response) => {
  try {
    const { slotId, tutorId, subjectId, modality, timestamp } = req.body;

    const studentIdFromToken = req.user ? Number(req.user.sub) : undefined;
    const studentId = studentIdFromToken ?? Number(req.body.studentId); 

    const slot = await prisma.classSlot.findUnique({ where: { id: Number(slotId) } });
    if (!slot || slot.status !== SlotStatus.AVAILABLE)
      return res.status(400).json({ error: "Slot not available" });

    const lesson = await prisma.lesson.create({
      data: {
        slotId: Number(slotId),
        studentId: Number(studentId),
        tutorId: Number(tutorId),
        subjectId: Number(subjectId),
        modality,
        timestamp,
        status: LessonStatus.PENDING,
      },
    });

    await prisma.classSlot.update({
      where: { id: Number(slotId) },
      data: { status: SlotStatus.RESERVED, reservedById: Number(studentId) },
    });

    res.status(201).json(lesson);
  } catch {
    res.status(500).json({ error: "Error creating lesson" });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { id, ...data } = req.body;
    const updated = await prisma.lesson.update({ where: { id: Number(id) }, data });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Error updating lesson" });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await prisma.lesson.delete({ where: { id: Number(id) } });
    res.json({ message: "Lesson deleted" });
  } catch {
    res.status(500).json({ error: "Error deleting lesson" });
  }
};
