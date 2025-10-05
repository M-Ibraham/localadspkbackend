import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./utils/db";
import authRoutes from "./routes/auth.routes";
import driverRoutes from "./routes/driver.routes";
import businessRoutes from "./routes/business.routes";
import adminRoutes from "./routes/admin.routes";
import campaignRoutes from "./routes/compaign.routes";
import path from "path";
import serverless from "serverless-http";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
app.use(
  "/" + UPLOAD_DIR,
  express.static(path.join(__dirname, "..", UPLOAD_DIR))
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/campaigns", campaignRoutes);

connectDB().then(() => {
  if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
});

// Export the Express app wrapped with serverless-http for Vercel
export default serverless(app);
