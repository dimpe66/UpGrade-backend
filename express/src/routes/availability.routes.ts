import { Router } from "express";
import {
  getAvailabilities,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from "../controllers/availability.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", getAvailabilities);

router.post("/", requireAuth, createAvailability);
router.post("/update", requireAuth, updateAvailability);
router.post("/delete", requireAuth, deleteAvailability);

export default router;
