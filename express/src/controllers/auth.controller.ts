import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ error: "Datos incompletos" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "El usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName,
        lastName,
        xpLevel: user.xpLevel,
        rating: user.rating,
        contactData: user.contactData,
        classroomAddress: user.classroomAddress,
        onlineClassroomLink: user.onlineClassroomLink,
        tutorSubjects: [],
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Faltan credenciales" });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { tutorSubjects: { include: { subject: true } } },
    });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        xpLevel: user.xpLevel,
        rating: user.rating,
        contactData: user.contactData,
        classroomAddress: user.classroomAddress,
        onlineClassroomLink: user.onlineClassroomLink,
        tutorSubjects: user.tutorSubjects ?? [],
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { tutorSubjects: { include: { subject: true } } },
    });

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
      tutorSubjects: user.tutorSubjects ?? [],
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};
