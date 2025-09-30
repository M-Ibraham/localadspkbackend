import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// JWT Secret from .env
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const signToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as any);
};
