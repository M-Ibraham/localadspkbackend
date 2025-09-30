import mongoose, { Schema, model } from "mongoose";

const PaymentSchema: Schema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "BusinessProfile",
      required: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    amount: { type: Number, required: true },
    transactionDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    split: {
      driverShare: { type: Number },
      platformShare: { type: Number },
    },
  },
  { timestamps: true }
);

export const Payment = model("Payment", PaymentSchema);
