import { Router } from "express";
import { getSubjects } from "../controllers/subject.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", requireAuth, getSubjects);

export default router;
