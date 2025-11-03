import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/user.controller";
const router = Router();

router.get("/", getUsers);
router.post("/", createUser);
router.post("/update", updateUser);
router.post("/delete", deleteUser);

export default router;
