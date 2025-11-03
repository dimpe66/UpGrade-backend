import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.query;
    const where: any = {};

    if (tutorId) {
      where.tutorSubjects = {
        some: { tutorId: Number(tutorId) },
      };
    }

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        tutorSubjects: {
          include: {
            tutor: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json(subjects);
  } catch {
    res.status(500).json({ error: "Error al obtener materias" });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, iconUrl } = req.body;
    if (!name) return res.status(400).json({ error: "Falta el nombre" });

    const subject = await prisma.subject.create({
      data: {
        name,
        iconUrl,
      },
    });

    res.status(201).json(subject);
  } catch {
    res.status(500).json({ error: "Error al crear materia" });
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id, name, iconUrl } = req.body;
    if (!id) return res.status(400).json({ error: "Falta id" });

    const subject = await prisma.subject.update({
      where: { id: Number(id) },
      data: { name, iconUrl },
    });

    res.json(subject);
  } catch {
    res.status(500).json({ error: "Error al actualizar materia" });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Falta id" });

    await prisma.subject.delete({ where: { id: Number(id) } });
    res.json({ message: "Materia eliminada" });
  } catch {
    res.status(500).json({ error: "Error al eliminar materia" });
  }
};
