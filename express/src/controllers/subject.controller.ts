import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: "Error fetching subjects" });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name, iconUrl } = req.body;
    const subject = await prisma.subject.create({
      data: { name, iconUrl },
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: "Error creating subject" });
  }
};
