import { Router } from "express";
import { getLessons, createLesson, cancelLesson } from "../controllers/lesson.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", requireAuth, getLessons);
router.post("/", requireAuth, createLesson);
router.post("/cancel", requireAuth, cancelLesson);

export default router;
