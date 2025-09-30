import { Request, Response } from "express";
import { DriverProfile } from "../models/driverProfile";
import { BusinessProfile } from "../models/businessProfile";
import { Campaign } from "../models/compaigns";

export const listPendingDrivers = async (req: Request, res: Response) => {
  try {
    const pending = await DriverProfile.find({ status: "pending" }).limit(100);
    res.json({ pending });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const approveDriver = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const driver = await DriverProfile.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    driver.status = "approved";
    await driver.save();
    res.json({ message: "Driver approved", driver });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const listCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 }).limit(200);
    res.json({ campaigns });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
