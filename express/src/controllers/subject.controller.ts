import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: "Error buscando materias" });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, iconUrl } = req.body;

    if (!name) {
      return res.status(400).json({ error: "El nombre de materia es obligatorio" });
    }

    const subject = await prisma.subject.create({
      data: { name, iconUrl },
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la materia" });
  }
};
