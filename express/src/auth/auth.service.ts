import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "./password";
import jwt, { type Secret } from "jsonwebtoken";
import type { StringValue } from "ms";

const prisma = new PrismaClient();

function signToken(payload: object) {
  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) throw new Error("JWT_SECRET no está definido");

  const expiresIn: StringValue | number =
    (process.env.JWT_EXPIRES_IN as StringValue | undefined) ?? "7d";

  return jwt.sign(payload, secret, { expiresIn });
}

export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("EMAIL_TAKEN");

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
    },
    select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
  });

  const token = signToken({ sub: user.id, email: user.email });
  return { user, token };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  const token = signToken({
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    iat: Math.floor(Date.now() / 1000),
  });

  return {
    token,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
  };
}
