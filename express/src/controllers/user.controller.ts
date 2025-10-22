import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const user = await prisma.user.create({
      data: { firstName, lastName, email },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
};