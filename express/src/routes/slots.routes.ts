import { Router } from "express";
import { getSlots, generateWeeklySlots, cancelSlot } from "../controllers/slot.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", requireAuth, getSlots);             
router.post("/generate-week", requireAuth, generateWeeklySlots); 
router.post("/cancel", requireAuth, cancelSlot);     

export default router;
