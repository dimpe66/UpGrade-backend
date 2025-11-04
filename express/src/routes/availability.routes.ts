import { Router } from "express";
import { getAvailability, createAvailability } from "../controllers/availability.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", requireAuth, getAvailability);
router.post("/", requireAuth, createAvailability);

export default router;
