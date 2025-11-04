import { Router } from "express";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subject.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", getSubjects);
router.post("/", requireAuth, createSubject);
router.post("/update", requireAuth, updateSubject);
router.post("/delete", requireAuth, deleteSubject);

export default router;
