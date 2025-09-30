import mongoose, { Schema, model } from "mongoose";

const BusinessProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: { type: String, required: true },
    industry: { type: String },
    contactPerson: { type: String, required: true },
    billingInfo: {
      address: { type: String },
      taxId: { type: String },
    },
    logoUrl: { type: String },
  },
  { timestamps: true }
);

export const BusinessProfile = model("BusinessProfile", BusinessProfileSchema);
