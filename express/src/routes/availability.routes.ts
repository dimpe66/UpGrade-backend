import { Router } from "express";
import {
  getAvailabilities,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from "../controllers/availability.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

// publica cualquiera pueda ver horarios
router.get("/", getAvailabilities);

// Privadas (crear/editar/borrar requieren token)
router.post("/", requireAuth, createAvailability);
router.post("/update", requireAuth, updateAvailability);
router.post("/delete", requireAuth, deleteAvailability);

export default router;
