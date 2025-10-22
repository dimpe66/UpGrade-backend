import express from "express";
import { getLessons, createLesson } from "../controllers/lesson.controller";

const router = express.Router();

router.get("/", getLessons);
router.post("/", createLesson);

export default router;
