import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getSubjects = async (_req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
    res.json(subjects);
  } catch {
    res.status(500).json({ error: "Error al obtener materias" });
  }
};
