import { Router } from "express";
import { getAvailabilities, createAvailability, updateAvailability, deleteAvailability } from "../controllers/availability.controller";
const router = Router();

router.get("/", getAvailabilities);
router.post("/", createAvailability);
router.post("/update", updateAvailability);
router.post("/delete", deleteAvailability);

export default router;
