import { Router } from "express";
import {
  register,
  login,
  me,
  updateUserRole,
} from "../controllers/auth.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/update-role", verifyToken, updateUserRole);
router.get("/me", verifyToken, me);

export default router;
