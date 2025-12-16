const express = require("express");
const path = require("path");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const donationRoutes = require("./routes/donations");
const userRoutes = require("./routes/users"); // 👈 新增（個人頁面用）

const app = express();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Static files (HTML / CSS / JS)
// ===============================
app.use(express.static(__dirname));

// ===============================
// Pages routing
// ===============================
app.get(["/add-donation", "/add-donation.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "add-donation.html"));
});

// 你之後可以加
// app.get("/profile", (req, res) => {
//   res.sendFile(path.join(__dirname, "profile.html"));
// });

// ===============================
// API routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/users", userRoutes); // 👈 個人資料 / 我的數據 / 我的商品

// ===============================
// Start server
// ===============================
const PORT = process.env.PORT || 3000;

// 👉 顯示「實際可用網址」
app.listen(PORT, () => {
  const host =
    process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : `http://localhost:${PORT}`;

  console.log("🚀 Server is running:");
  console.log(`👉 ${host}`);
});
