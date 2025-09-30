import mongoose, { Schema, model } from "mongoose";

const AdminProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    roleType: {
      type: String,
      enum: ["super", "finance", "support"],
      default: "support",
    },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

export const AdminProfile = model("AdminProfile", AdminProfileSchema);
