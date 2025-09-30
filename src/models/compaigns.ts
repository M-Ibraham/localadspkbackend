import mongoose, { Schema, model } from "mongoose";

const AssignedDriverSchema = new Schema({
  driverId: { type: Schema.Types.ObjectId, ref: "DriverProfile" },
  status: {
    type: String,
    enum: ["accepted", "rejected", "pending"],
    default: "pending",
  },
  assignedAt: { type: Date, default: Date.now },
});

const CampaignSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "BusinessProfile",
      required: true,
    },
    city: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, required: true },
    perDaybudget: { type: Number, required: true },
    vehicles: { type: Number, required: true },
    bannerUrl: { type: String },
    assignedDrivers: [AssignedDriverSchema],
    isActive: { type: Boolean, default: true },
    // status: {
    //   type: String,
    //   enum: ["pending", "active", "completed", "cancelled"],
    //   default: "pending",
    // },
  },
  { timestamps: true }
);

export const Campaign = model("Campaign", CampaignSchema);
