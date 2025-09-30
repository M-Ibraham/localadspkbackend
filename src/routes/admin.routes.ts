import { Router } from "express";
import {
  listPendingDrivers,
  approveDriver,
  listCampaigns,
} from "../controllers/admin.controller";
import { verifyToken, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/drivers/pending",
  verifyToken,
  requireRole(["admin", "super"]),
  listPendingDrivers
);
router.post(
  "/drivers/:driverId/approve",
  verifyToken,
  requireRole(["admin", "super"]),
  approveDriver
);
router.get(
  "/campaigns",
  verifyToken,
  requireRole(["admin", "super"]),
  listCampaigns
);

export default router;
