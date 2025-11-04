import { Router } from "express";
import { getSlots, createSlot } from "../controllers/slot.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", requireAuth, getSlots);
router.post("/", requireAuth, createSlot);

export default router;
