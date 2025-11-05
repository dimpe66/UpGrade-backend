import { Router } from "express";
import { getSubjects, createSubject } from "../controllers/subject.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", requireAuth, getSubjects);
router.post("/", requireAuth, createSubject);

export default router;
