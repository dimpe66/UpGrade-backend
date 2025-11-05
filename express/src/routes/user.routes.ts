import { Router } from "express";
import {
  getUsers,
  getUserById,
  getTutorsWithAvailableSlots,
  updateMe,
  updateTutorSubjects, 
} from "../controllers/user.controller";

import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", requireAuth, getUsers);
router.get("/tutors", requireAuth, getTutorsWithAvailableSlots);
router.get("/:id", requireAuth, getUserById);
router.post("/me", requireAuth, updateMe);
router.post("/me/subjects", requireAuth, updateTutorSubjects);


export default router;
