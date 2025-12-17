import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import cors from "cors";
import multer from "multer";
import fs from "fs";

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


// ===============================
// Static files
// ===============================
app.use(express.static(__dirname));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

// ===============================
// Upload API (save files to /uploads, DB stores path)
// ===============================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 讓 /uploads/xxx 可以被瀏覽器讀到
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
    cb(null, `img_${Date.now()}_${Math.random().toString(16).slice(2)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// 測試用：確認 upload 路由存在
app.get("/api/upload/ping", (req, res) => res.json({ ok: true }));

// 真正上傳：POST /api/upload  (FormData key 必須叫 image)
app.post("/api/upload", upload.single("image"), (req, res) => {
  console.log("✅ hit POST /api/upload", !!req.file, req.file?.originalname);

  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const image_url = `/uploads/${req.file.filename}`;
  res.json({ message: "Upload success", image_url });
});

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
