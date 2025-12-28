import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import path from "path";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import requestRoutes from "./routes/requests.js";
import uploadRoutes from "./routes/upload.js";


console.log("✅ RUNNING server.js from:", new URL(import.meta.url).pathname);

console.log("✅ mounting /api/requests");
console.log("✅ requestRoutes type:", typeof requestRoutes);



// ESM 下沒有 __dirname，要自己做
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API routes (ESM)
import authRoutes from "./routes/auth.js";
import donationRoutes from "./routes/donations.js";
import userRoutes from "./routes/users.js";
import aiRoutes from "./routes/ai.js"; // ✅ 只新增這行

const app = express();
console.log("✅ LOADED server.js", new Date().toISOString());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/ai", aiRoutes);
app.use("/api/requests", requestRoutes);

app.get("/api/debug/cloudinary", (req, res) => {
  res.json({
    cloudinary_url: process.env.CLOUDINARY_URL ? "set" : null,
  });
});

// ===============================
// Static files
// ===============================
app.use(express.static(__dirname));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

app.use("/api/upload", uploadRoutes);

// ===============================
// Pages routing (optional insurance)
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get(["/add-donation", "/add-donation.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "add-donation.html"));
});

app.get(["/profile", "/profile.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "profile.html"));
});

// ===============================
// API routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/users", userRoutes);

// health check（Railway 很愛用）
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;

// ✅ 印出「可點的網址」
function getPublicUrl() {
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL;
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL;
  return `http://localhost:${PORT}`;
}

app.listen(PORT, () => {
  console.log(`🚀 Server running at ${getPublicUrl()}`);
  console.log("OPENAI KEY:", process.env.OPENAI_API_KEY?.slice(0, 8) || "(not set)");
});
