import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany();
    res.json(subjects);
  } catch {
    res.status(500).json({ error: "Error fetching subjects" });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, iconUrl } = req.body;
    const subject = await prisma.subject.create({ data: { name, iconUrl } });
    res.status(201).json(subject);
  } catch {
    res.status(500).json({ error: "Error creating subject" });
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id, ...data } = req.body;
    const subject = await prisma.subject.update({ where: { id: Number(id) }, data });
    res.json(subject);
  } catch {
    res.status(500).json({ error: "Error updating subject" });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await prisma.subject.delete({ where: { id: Number(id) } });
    res.json({ message: "Subject deleted" });
  } catch {
    res.status(500).json({ error: "Error deleting subject" });
  }
};
