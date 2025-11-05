import { PrismaClient, SlotStatus } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../auth/requireAuth";

const prisma = new PrismaClient();

export const getUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        tutorSubjects: { include: { subject: true } },
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
      include: {
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
      include: {
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

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const {
      classroomAddress,
      onlineClassroomLink,
      contactData,
    }: {
      classroomAddress?: string | null;
      onlineClassroomLink?: string | null;
      contactData?: string | null;
    } = req.body || {};

    const payload: Record<string, string | null> = {};
    if (classroomAddress !== undefined) {
      payload.classroomAddress =
        classroomAddress === null ? null : String(classroomAddress).trim();
    }
    if (onlineClassroomLink !== undefined) {
      payload.onlineClassroomLink =
        onlineClassroomLink === null ? null : String(onlineClassroomLink).trim();
    }
    if (contactData !== undefined) {
      payload.contactData = contactData === null ? null : String(contactData).trim();
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: payload,
      include: {
        tutorSubjects: { include: { subject: true } },
      },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};

export const updateTutorSubjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { subjectIds } = req.body as { subjectIds: number[] };

    if (!Array.isArray(subjectIds)) {
      return res.status(400).json({ error: "subjectIds debe ser un array de números" });
    }

    await prisma.tutorSubject.deleteMany({
      where: { tutorId: userId },
    });

    const createData = subjectIds.map((id) => ({
      tutorId: userId,
      subjectId: id,
    }));

    if (createData.length > 0) {
      await prisma.tutorSubject.createMany({ data: createData });
    }

    const updatedTutorSubjects = await prisma.tutorSubject.findMany({
      where: { tutorId: userId },
      include: { subject: true },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { tutorSubjects: { include: { subject: true } } },
    });

    res.json({
      message: "Materias actualizadas correctamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar las materias del tutor" });
  }
};