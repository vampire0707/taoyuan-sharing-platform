import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// 確保 uploads 資料夾存在
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 存檔規則
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

router.get("/ping", (req, res) => {
  res.json({ ok: true });
});

router.get("/ping", (req, res) => res.json({ ok: true }));

router.post("/", upload.single("image"), (req, res) => {
  console.log("✅ hit POST /api/upload", !!req.file, req.file?.originalname);

  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const urlPath = `/uploads/${req.file.filename}`;
  res.json({ message: "Upload success", image_url: urlPath });

});

export default router;
