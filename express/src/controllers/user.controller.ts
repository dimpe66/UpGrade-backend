import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch {
    res.status(500).json({ error: "Error fetching users" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email } = req.body;
    if (!firstName || !lastName || !email) return res.status(400).json({ error: "Missing fields" });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already exists" });
    const user = await prisma.user.create({ data: { firstName, lastName, email } });
    res.status(201).json(user);
  } catch {
    res.status(500).json({ error: "Error creating user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id, ...data } = req.body;
    const user = await prisma.user.update({ where: { id: Number(id) }, data });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Error updating user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ error: "Error deleting user" });
  }
};
