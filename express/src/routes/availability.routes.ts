import express from "express";
import { createAvailability, getTutorAvailability } from "../controllers/availability.controller";

const router = express.Router();

router.get("/", getTutorAvailability);
router.post("/", createAvailability);

export default router;
