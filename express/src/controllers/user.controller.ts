import { PrismaClient, SlotStatus } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../auth/requireAuth";

const prisma = new PrismaClient();

export const getUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        xpLevel: true,
        rating: true,
        contactData: true,
        classroomAddress: true,
        onlineClassroomLink: true,
        profilePhoto: true
      },
      orderBy: { id: "asc" },
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        xpLevel: true,
        rating: true,
        contactData: true,
        classroomAddress: true,
        onlineClassroomLink: true,
        profilePhoto: true,
        tutorAvailabilities: true,
        tutorSubjects: { include: { subject: true } },
      },
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

export const getTutorsWithAvailableSlots = async (_req: AuthRequest, res: Response) => {
  try {
    const tutors = await prisma.user.findMany({
      where: {
        classSlots: {
          some: {
            status: SlotStatus.AVAILABLE,
            date: { gte: new Date() },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rating: true,
        contactData: true,
        classroomAddress: true,
        onlineClassroomLink: true,
        tutorSubjects: {
          include: { subject: { select: { id: true, name: true, iconUrl: true } } },
        },
        classSlots: {
          where: {
            status: SlotStatus.AVAILABLE,
            date: { gte: new Date() },
          },
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
          },
          orderBy: { date: "asc" },
        },
      },
      orderBy: { rating: "desc" },
    });

    res.json(tutors);
  } catch {
    res.status(500).json({ error: "Error al obtener tutores disponibles" });
  }
};
