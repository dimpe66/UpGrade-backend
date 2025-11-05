import { Router } from "express";
import {
  getAvailability,
  createAvailability,
  deleteAvailability,
} from "../controllers/availability.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", requireAuth, getAvailability);
router.post("/", requireAuth, createAvailability);
router.post("/delete", requireAuth, deleteAvailability);

export default router;
