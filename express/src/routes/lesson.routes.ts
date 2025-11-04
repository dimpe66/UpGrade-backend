import { Router } from "express";
import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../controllers/lesson.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", getLessons);
router.post("/", requireAuth, createLesson);
router.post("/update", requireAuth, updateLesson);
router.post("/delete", requireAuth, deleteLesson);

export default router;
