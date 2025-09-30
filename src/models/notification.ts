import mongoose, { Schema, model } from "mongoose";

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    title: { type: String },
    message: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = model("Notification", NotificationSchema);
