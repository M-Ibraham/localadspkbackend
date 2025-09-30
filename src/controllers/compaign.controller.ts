import { Request, Response } from "express";
import { Campaign } from "../models/compaigns";
import { DriverProfile } from "../models/driverProfile";
import { Notification } from "../models/notification";
import mongoose from "mongoose";

/**
 * Auto-assign algorithm (basic):
 *  - Find approved drivers in target areas who are not currently assigned in overlapping campaigns
 *  - Prefer drivers with higher rating and fewer current assignments
 */

export const autoAssignDrivers = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const campaign: any = await Campaign.findById(campaignId);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    // find drivers in target areas
    const q: any = {
      status: "approved",
      city: {
        $in: campaign.targetAreas.map((a: string) => a.split(" - ")[0]),
      },
    };
    const candidates = await DriverProfile.find(q);

    // Simple filter: pick first N requiredVehicles who aren't already assigned to overlapping campaigns
    const selected: any[] = [];
    for (const d of candidates) {
      if (selected.length >= campaign.requiredVehicles) break;
      // check if driver already assigned in campaign.assignedDrivers or other active campaigns
      const already = campaign.assignedDrivers.some(
        (ad: any) => ad.driverId?.toString() === d._id?.toString()
      );
      if (already) continue;
      selected.push(d);
    }

    // push assignments
    selected.slice(0, campaign.requiredVehicles).forEach((d: any) => {
      campaign.assignedDrivers.push({ driverId: d._id, status: "active" });
    });

    await campaign.save();

    // notify drivers
    for (const d of selected.slice(0, campaign.requiredVehicles)) {
      await Notification.create({
        userId: d.userId,
        type: "campaign_assigned",
        title: `New Campaign Assigned: ${campaign.title}`,
        message: `You have been assigned to campaign ${campaign.title}. Please confirm installation.`,
      });
    }

    res.json({
      message: "Drivers auto-assigned",
      assignedCount: selected.length,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const driverAcceptCampaign = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // from auth middleware
    const { campaignId, status } = req.params;

    // Validate campaignId shape early (optional but helpful)
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign id" });
    }

    const campaign: any = await Campaign.findById(campaignId);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    if (!campaign.isActive)
      return res.status(400).json({ message: "Campaign is not active" });

    // Normalize/validate status
    const driverStatus: "accepted" | "rejected" =
      status === "accepted" ? "accepted" : "rejected";

    // Ensure array exists
    if (!Array.isArray(campaign.assignedDrivers)) {
      campaign.assignedDrivers = [];
    }

    // Upsert driver assignment
    const idx = campaign.assignedDrivers.findIndex(
      (d: any) => d.driverId?.toString() === userId.toString()
    );

    if (idx !== -1) {
      campaign.assignedDrivers[idx].status = driverStatus;
      campaign.assignedDrivers[idx].updatedAt = new Date();
    } else {
      campaign.assignedDrivers.push({
        driverId: userId,
        status: driverStatus,
        assignedAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await campaign.save();

    if (driverStatus === "accepted") {
      // ✅ FIX: use findOne({ userId }) or updateOne with a filter
      await DriverProfile.updateOne(
        { userId }, // filter by userId field
        { $set: { isActive: true } } // mark active
      );
      return res.json({ message: "Campaign accepted successfully" });
    }

    return res.json({ message: "Campaign rejected successfully" });
  } catch (err: any) {
    console.error("driverAcceptCampaign error:", err?.message);
    return res
      .status(500)
      .json({ message: "Server error", error: err?.message });
  }
};
