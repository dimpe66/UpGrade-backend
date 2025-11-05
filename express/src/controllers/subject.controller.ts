import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getSubjects = async (_req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({ select: { id: true, name: true, iconUrl: true }, orderBy: { name: "asc" } });
    res.json(subjects);
  } catch {
    res.status(500).json({ error: "Error al obtener materias" });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, iconUrl } = req.body;
    if (!name) return res.status(400).json({ error: "El nombre es obligatorio" });
    const exists = await prisma.subject.findFirst({ where: { name } });
    if (exists) return res.status(400).json({ error: "La materia ya existe" });
    const subject = await prisma.subject.create({ data: { name, iconUrl } });
    res.status(201).json(subject);
  } catch {
    res.status(500).json({ error: "Error al crear materia" });
  }
};
