import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { hashPassword } from "../auth/password";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, updatedAt: true }
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Error fetching users" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body; 
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already exists" });

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { firstName, lastName, email, passwordHash },
      
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true }
    });

    res.status(201).json(user);
  } catch {
    res.status(500).json({ error: "Error creating user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id, password, passwordHash, ...rest } = req.body;
    const data: any = { ...rest };

    if (password) {
      data.passwordHash = await hashPassword(password);
      data.passwordUpdatedAt = new Date();
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, updatedAt: true }
    });

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
