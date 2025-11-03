import { Router } from "express";
import { getLessons, createLesson, updateLesson, deleteLesson } from "../controllers/lesson.controller";
const router = Router();

router.get("/", getLessons);
router.post("/", createLesson);
router.post("/update", updateLesson);
router.post("/delete", deleteLesson);

export default router;
