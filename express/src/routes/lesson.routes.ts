import { Router } from "express";
import { getLessons, createLesson, updateLessonStatus, deleteLesson } from "../controllers/lesson.controller";

const router = Router();

router.get("/", getLessons);
router.post("/create", createLesson);
router.post("/update-status", updateLessonStatus);
router.post("/delete", deleteLesson);

export default router;