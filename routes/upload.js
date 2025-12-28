// routes/upload.js
import express from "express";
import multer from "multer";
import cloudinary from "../cloudinary.js";

const router = express.Router();

// 不落地到 uploads/，改成記憶體
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.get("/ping", (req, res) => res.json({ ok: true }));

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("✅ hit POST /api/upload", !!req.file, req.file?.originalname);

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "donations",
          resource_type: "image",
        },
        (err, r) => (err ? reject(err) : resolve(r))
      );
      stream.end(req.file.buffer);
    });

    // ✅ 回傳 Cloudinary 的 https URL（永久，不會因部署消失）
    res.json({ message: "Upload success", image_url: result.secure_url });
  } catch (e) {
  console.error("❌ Upload failed:", e); // ← 加這行
  res.status(500).json({ message: "Upload failed", error: String(e) });
  }
});

export default router;
