import mongoose, { Schema, model } from "mongoose";

const DriverProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cnic: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    vehicleType: {
      type: String,
      enum: ["rickshaw", "taxi", "car", "van", "bus"],
      required: true,
    },
    vehicleNo: { type: String, required: true },
    routes: { type: String, required: true },
    city: { type: String, required: true },
    licenseNo: { type: String },
    bankAccount: {
      bankName: { type: String },
      accountNo: { type: String },
    },
    docs: {
      profilePhotoUrl: { type: String },
      vehiclePhotoUrl: { type: String },
      cnicPhotoUrl: { type: String },
      licenseUrl: { type: String },
    },
    isActive: { type: Boolean, default: false },
    // status: {
    //   type: String,
    //   enum: ["pending", "approved", "rejected"],
    //   default: "pending",
    // },
    rating: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export const DriverProfile = model("DriverProfile", DriverProfileSchema);
