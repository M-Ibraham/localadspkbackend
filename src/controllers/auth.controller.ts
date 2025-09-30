import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User"; // import your User schema
import { signToken } from "../utils/jwt";
import { DriverProfile } from "../models/driverProfile";
import { BusinessProfile } from "../models/businessProfile";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: passwordHash,
    });

    await user.save();

    // Create JWT token
    const token = signToken({ id: user._id });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ------------------- LOGIN ------------------- */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user: any = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = signToken({ id: user._id });
    console.log(user.role);
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { role } = req.body; // new role, e.g., "driver", "admin", "business"

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: "User role updated successfully",
      user: { id: user._id, role: user.role },
    });
  } catch (err: any) {
    console.error("UpdateUserRole Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------- GET CURRENT USER ------------------- */
export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // from middleware
    const user: any = await User.findById(userId).select(
      "-password -passwordHash -__v"
    );

    let userProfile: any = {};
    if (user.role == "driver") {
      userProfile = await DriverProfile.findOne({ userId });
    } else if (user.role == "business") {
      userProfile = await BusinessProfile.findOne({ userId });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user, profile: userProfile });
  } catch (error: any) {
    console.error("Me Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
