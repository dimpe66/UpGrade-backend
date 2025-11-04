import { Router } from "express";
import { getSlots, createSlot, updateSlot, deleteSlot } from "../controllers/slot.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", getSlots);
router.post("/", requireAuth, createSlot);
router.post("/update", requireAuth, updateSlot);
router.post("/delete", requireAuth, deleteSlot);

export default router;
