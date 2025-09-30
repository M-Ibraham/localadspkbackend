import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./db";
import { User } from "../models/User";
import { AdminProfile } from "../models/adminProfile";
import bcrypt from "bcryptjs";

const run = async () => {
  await connectDB();
  const email = process.env.SUPER_ADMIN_EMAIL || "super@localads.test";
  // const phone = process.env.SUPER_ADMIN_PHONE || "0000000000";
  const password = process.env.SUPER_ADMIN_PASS || "Super@123";

  const exists = await User.findOne({ $or: [{ email }] });
  if (exists) {
    console.log("Super admin already exists");
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = new User({
    name: "Super Admin",
    email,
    // phone,
    passwordHash,
    role: "admin",
  });
  await user.save();
  const adminProfile = new AdminProfile({
    userId: user._id,
    roleType: "super",
    permissions: ["manageUsers", "managePayments", "manageCampaigns"],
  });
  await adminProfile.save();

  console.log("Super admin created:", { email, password });
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
