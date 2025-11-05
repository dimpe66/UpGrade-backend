import { Router } from "express";
import { login, register, me } from "../auth/auth.controller";
import { requireAuth } from "./requireAuth";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
export default router;
