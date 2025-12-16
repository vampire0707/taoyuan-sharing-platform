// server.js (CommonJS)
require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const donationRoutes = require("./routes/donations");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態檔案（index.html / styles.css / script.js / i18n.js / profile.html / profile.css...）
app.use(express.static(__dirname));

// 讓 / 直接回首頁（保險）
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// add-donation
app.get(["/add-donation", "/add-donation.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "add-donation.html"));
});

// profile
app.get(["/profile", "/profile.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "profile.html"));
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);

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
});
