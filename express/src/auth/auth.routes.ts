import { Router } from "express";
import { registerUser, loginUser } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schemas";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);
    const user = await registerUser(body.email, body.password, body.firstName, body.lastName);
    return res.status(201).json({ user });
  } catch (err: any) {
    if (err?.message === "EMAIL_TAKEN") {
      return res.status(409).json({ error: "Ese email ya está registrado." });
    }
    if (err?.name === "ZodError") {
      return res.status(400).json({ error: "Datos inválidos.", details: err.errors });
    }
    return res.status(500).json({ error: "Error interno." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await loginUser(body.email, body.password);
    return res.json(result);
  } catch (err: any) {
    if (err?.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }
    if (err?.name === "ZodError") {
      return res.status(400).json({ error: "Datos inválidos.", details: err.errors });
    }
    return res.status(500).json({ error: "Error interno." });
  }
});

export default router;
