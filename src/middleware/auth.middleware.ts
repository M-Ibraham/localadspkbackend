import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/User";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  console.log("Auth Header:", req.headers); // Debugging line
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole =
  (roles: string[]) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      console.log("User from token:", user); // Debugging line

      if (!user || !user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Fetch user from database to get the role
      const dbUser = await User.findById(user.id).select("role");

      if (!dbUser) {
        return res.status(401).json({ message: "User not found" });
      }

      console.log("User role from DB:", dbUser.role);
      console.log("Required roles:", roles);

      // Check if user role is in the allowed roles
      if (!roles.includes(dbUser.role as string)) {
        return res.status(403).json({
          message: "Access denied",
          userRole: dbUser.role,
          requiredRoles: roles,
        });
      }

      // Update req.user with the role from database
      req.user.role = dbUser.role;

      next();
    } catch (error) {
      console.error("Role verification error:", error);
      return res
        .status(500)
        .json({ message: "Server error during role verification" });
    }
  };
