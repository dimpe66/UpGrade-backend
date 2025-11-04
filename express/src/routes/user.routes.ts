import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/user.controller";
import { requireAuth } from "../auth/requireAuth";

const router = Router();


router.get("/", getUsers);


router.post("/", requireAuth, createUser);
router.post("/update", requireAuth, updateUser);
router.post("/delete", requireAuth, deleteUser);

export default router