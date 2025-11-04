import { Router } from "express";
import { getLessons, createLesson } from "../controllers/lesson.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", requireAuth, getLessons);
router.post("/", requireAuth, createLesson);

export default router;