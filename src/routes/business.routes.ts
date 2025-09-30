import { Router } from "express";
import {
  createBusinessProfile,
  createCampaign,
  payForCampaign,
} from "../controllers/business.controller";
import { verifyToken, requireRole } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post(
  "/profile",
  verifyToken,
  // requireRole(["business"]),
  upload.single("logo"),
  createBusinessProfile
);
router.post(
  "/campaign",
  verifyToken,
  requireRole(["business"]),
  upload.single("bannerUrl"),
  createCampaign
);
router.post(
  "/campaign/pay",
  verifyToken,
  requireRole(["business"]),
  payForCampaign
);

export default router;
