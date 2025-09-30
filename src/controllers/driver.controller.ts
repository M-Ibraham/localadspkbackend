import { Request, Response } from "express";
import { DriverProfile } from "../models/driverProfile";
import { User } from "../models/User";
import { Campaign } from "../models/compaigns";
import { BusinessProfile } from "../models/businessProfile";

export const createDriverProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const existing = await DriverProfile.findOne({ userId });
    if (existing)
      return res.status(400).json({ message: "Profile already exists" });

    // Prepare docs dynamically from req.files
    const docs: Record<string, string | undefined> = {};
    if (req.files && typeof req.files === "object") {
      for (const key in req.files) {
        if (req.files[key]?.[0]?.path) {
          docs[`${key}Url`] = req.files[key][0].path;
        }
      }
    }

    const payload = {
      userId,
      cnic: req.body.cnic,
      phone_number: req.body.phone,
      address: req.body.address,
      vehicleType: req.body.vehicleType,
      vehicleNo: req.body.vehicleNo,
      routes: req.body.routes,
      city: req.body.city,
      licenseNo: req.body.licenseNo,
      bankAccount: req.body.bankAccount,
      docs,
    };

    const profile = new DriverProfile(payload);
    await profile.save();

    // optionally update user's role to driver (if not already)
    await User.findByIdAndUpdate(userId, { role: "driver" });

    res.status(201).json({ message: "Driver profile created", profile });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getDriverProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const profile = await DriverProfile.findOne({ userId }).populate(
      "userId",
      "name phone"
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json({ profile });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const listAvailableDrivers = async (req: Request, res: Response) => {
  // basic filter by city & vehicleType & status approved
  try {
    const { city, vehicleType, limit = 50 } = req.query;
    const q: any = { status: "approved" };
    if (city) q.city = city;
    if (vehicleType) q.vehicleType = vehicleType;
    const drivers = await DriverProfile.find(q).limit(Number(limit));
    res.json({ drivers });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const listAvailableCampaigns = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const user: any = await DriverProfile.findOne({ userId });

    if (user.isActive) {
      return res
        .status(400)
        .json({ message: "Driver already active in a campaign" });
    }

    const existingCampaign = await Campaign.find({
      city: user.city,
      isActive: true,
    });

    if (!existingCampaign.length) {
      return res.status(400).json({ message: "Campaign not available" });
    }

    const campaigns = await Promise.all(
      existingCampaign.map(async (campaign: any) => {
        if (campaign.assignedDrivers.length < campaign.vehicles) {
          const business = await BusinessProfile.findOne({
            _id: campaign.businessId,
          });

          return {
            ...campaign.toObject(),
            business: business?.industry,
          };
        }
        // Instead of sending response here, return null or a flag
        return null;
      })
    );

    // Filter out null values (campaigns where driver limit is complete)
    const filteredCampaigns = campaigns.filter((c) => c !== null);

    if (filteredCampaigns.length === 0) {
      return res
        .status(400)
        .json({ message: "All campaign driver limits are complete" });
    }

    return res.json({ campaigns });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAcceptedCampaigns = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Find campaigns where the driver has accepted
    const campaigns = await Campaign.find({
      "assignedDrivers.driverId": userId,
      "assignedDrivers.status": "accepted",
    }).populate("businessId", "industry companyName");

    // Separate campaigns into active and expired
    const now = new Date();
    const activeCampaigns: any = [];
    const expiredCampaigns: any = [];

    campaigns.forEach((campaign: any) => {
      const campaignData = {
        _id: campaign._id,
        title: campaign.title,
        city: campaign.city,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        budget: campaign.budget,
        perDaybudget: campaign.perDaybudget,
        vehicles: campaign.vehicles,
        bannerUrl: campaign.bannerUrl,
        isActive: campaign.isActive,
        business: {
          industry: campaign.businessId?.industry,
          companyName: campaign.businessId?.companyName,
        },
        assignedAt: campaign.assignedDrivers.find(
          (ad: any) => ad.driverId?.toString() === userId.toString()
        )?.assignedAt,
        status: campaign.assignedDrivers.find(
          (ad: any) => ad.driverId?.toString() === userId.toString()
        )?.status,
      };

      if (campaign.endDate < now) {
        expiredCampaigns.push(campaignData);
      } else {
        activeCampaigns.push(campaignData);
      }
    });

    res.json({
      message: "Accepted campaigns retrieved successfully",
      data: {
        active: activeCampaigns,
        expired: expiredCampaigns,
        total: campaigns.length,
      },
    });
  } catch (err: any) {
    console.error("Get accepted campaigns error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
