import { Router } from "express";
import { getSubjects, createSubject, updateSubject, deleteSubject } from "../controllers/subject.controller";
const router = Router();

router.get("/", getSubjects);
router.post("/", createSubject);
router.post("/update", updateSubject);
router.post("/delete", deleteSubject);

export default router;
