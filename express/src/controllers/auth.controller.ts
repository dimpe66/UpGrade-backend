import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ error: "Faltan campos obligatorios" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "El usuario ya existe" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashed },
    });

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: { email: user.email, firstName: user.firstName, lastName: user.lastName },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Debe ingresar email y contraseña" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};
