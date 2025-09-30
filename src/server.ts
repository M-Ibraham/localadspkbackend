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
import { fileURLToPath } from "url";

// Compute __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true, // allow preview deployments
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ❌ Don't serve a writable /uploads on Vercel (read-only FS).
// If you only need to READ static files, place them in /public and serve them via Next/static hosting,
// or host user uploads on S3/Cloudinary/Vercel Blob and return URLs.
// The following is disabled on Vercel to prevent crashes:
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
if (process.env.VERCEL !== "1") {
  app.use(
    "/" + UPLOAD_DIR,
    express.static(path.join(__dirname, "..", UPLOAD_DIR))
  );
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/campaigns", campaignRoutes);

// Health endpoint (handy for Vercel checks)
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Wrap Express for serverless
let handler;
export default async function (req, res) {
  try {
    await connectDB(); // ensure DB ready before handling
    if (!handler) handler = serverless(app);
    return handler(req, res);
  } catch (err) {
    console.error("Function error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Optional: keep local dev server ONLY when not on Vercel
if (process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Local server on ${PORT}`));
  });
}
