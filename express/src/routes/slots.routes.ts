import express from "express";
import { getAvailableSlots } from "../controllers/slot.controller"

const router = express.Router();
router.get("/", getAvailableSlots);
export default router