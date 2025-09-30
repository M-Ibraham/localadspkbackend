import { Request, Response } from "express";
import { BusinessProfile } from "../models/businessProfile";
import { User } from "../models/User";
import { Campaign } from "../models/compaigns";
import { Payment } from "../models/payment";

export const createBusinessProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const existing = await BusinessProfile.findOne({ userId });
    if (existing) return res.status(400).json({ message: "Profile exists" });

    const payload = {
      userId,
      businessName: req.body.businessName,
      industry: req.body.industry,
      contactPerson: req.body.contactPerson,
      billingInfo: req.body.billingInfo,
      logoUrl: req.file ? req.file.path : undefined,
    };
    const profile = new BusinessProfile(payload);
    await profile.save();
    await User.findByIdAndUpdate(userId, { role: "business" });
    res.status(201).json({ message: "Business profile created", profile });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createCampaign = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const business = await BusinessProfile.findOne({ userId });
    if (!business)
      return res.status(400).json({ message: "Business profile required" });
    console.log(req.body);
    const payload = {
      title: req.body.title,
      businessId: business._id,
      city: req.body.city,
      // areas: req.body.targetAreas || [],
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      budget: req.body.budget,
      vehicles: req.body.vehicles,
      bannerUrl: req.file ? req.file.path : undefined,
      perDaybudget: req.body.perDaybudget,
      // paymentStatus: "pending",
      status: "pending",
    };
    console.log("Creating campaign with payload:", payload); // Debugging line

    const campaign = new Campaign(payload);
    await campaign.save();

    // Optionally create Payment record here (if pay now flow)
    res.status(201).json({ message: "Campaign created", campaign });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const payForCampaign = async (req: Request, res: Response) => {
  try {
    // Payment integration placeholder - here we mark payment completed for demo
    const { campaignId, amount } = req.body;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    const payment = new Payment({
      businessId: campaign.businessId,
      campaignId: campaign._id,
      amount,
      status: "completed",
      transactionDate: new Date(),
      split: {
        driverShare: Math.round(amount * 0.7),
        platformShare: Math.round(amount * 0.3),
      },
    });
    await payment.save();

    campaign.paymentStatus = "paid";
    campaign.status = "active";
    await campaign.save();

    res.json({
      message: "Payment completed and campaign activated",
      payment,
      campaign,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
