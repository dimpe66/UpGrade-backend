import { Router } from "express";
import { getUsers, getProfile } from "../controllers/user.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();

router.get("/", requireAuth, getUsers);
router.get("/me", requireAuth, getProfile);

export default router;
