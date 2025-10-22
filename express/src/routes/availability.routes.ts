import express from "express";
import { createAvailability } from "../controllers/availability.controller";

const router = express.Router();

router.post("/", createAvailability);

export default router;