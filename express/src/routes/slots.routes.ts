import { Router } from "express";
import { getSlots, createSlot, updateSlot, deleteSlot } from "../controllers/slot.controller";
const router = Router();

router.get("/", getSlots);
router.post("/", createSlot);
router.post("/update", updateSlot);
router.post("/delete", deleteSlot);

export default router;
