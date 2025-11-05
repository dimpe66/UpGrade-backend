import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) return res.status(400).json({ error: "Datos incompletos" });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "El usuario ya existe" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { firstName, lastName, email, password: hashed } });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user.id, email: user.email, firstName, lastName } });
  } catch {
    res.status(500).json({ error: "Error al registrar" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Faltan credenciales" });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, 
      contactData: user.contactData, classroomAddress: user.classroomAddress, onlineClassroomLink: user.onlineClassroomLink
     }});
  } catch {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No autorizado" });
    const token = header.split(" ")[1];
    const { id } = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      xpLevel: user.xpLevel,
      rating: user.rating,
      contactData: user.contactData,
      classroomAddress: user.classroomAddress,
      onlineClassroomLink: user.onlineClassroomLink,
      profilePhoto: user.profilePhoto
    });
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};
