import { Router } from "express";
import {
  autoAssignDrivers,
  driverAcceptCampaign,
} from "../controllers/compaign.controller";
import { verifyToken, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/:campaignId/auto-assign",
  verifyToken,
  requireRole(["admin", "support"]),
  autoAssignDrivers
);

router.post(
  "/accept/:campaignId/:status",
  verifyToken,
  requireRole(["driver"]),
  driverAcceptCampaign
);

export default router;
