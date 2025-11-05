import { Router } from "express";
import { getUsers, getUserById, getTutorsWithAvailableSlots } from "../controllers/user.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", requireAuth, getUsers);
router.get("/tutors", requireAuth, getTutorsWithAvailableSlots);
router.get("/:id", requireAuth, getUserById);

export default router;
