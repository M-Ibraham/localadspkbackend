import { Router } from "express";
import {
  createDriverProfile,
  getDriverProfile,
  listAvailableDrivers,
  listAvailableCampaigns,
  getAcceptedCampaigns,
} from "../controllers/driver.controller";
import { verifyToken, requireRole } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post(
  "/profile",
  verifyToken,
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "vehicle", maxCount: 1 },
    { name: "cnic", maxCount: 1 },
    { name: "license", maxCount: 1 },
  ]),
  createDriverProfile
);

router.get("/me", verifyToken, requireRole(["driver"]), getDriverProfile);
router.get("/available", listAvailableDrivers);
router.get("/invitation", verifyToken, listAvailableCampaigns);
router.get(
  "/accepted-campaigns",
  verifyToken,
  requireRole(["driver"]),
  getAcceptedCampaigns
);

export default router;
