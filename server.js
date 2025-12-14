// server.js

const db = require('./db');

db.query("SELECT 1")
  .then(() => console.log("✅ MySQL 連線成功！"))
  .catch(err => console.error("❌ MySQL 連線失敗：", err));

const express = require('express');
const path = require('path');
const cors = require('cors');          // ⭐ 新增

const app = express();

const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations'); 

// ⭐ 開 CORS
app.use(cors());


// 讓 Express 可以解析 JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態檔案（index.html / login.html / register.html / JS / CSS）
app.use(express.static(__dirname));

// 強制用 HTML 回傳 add-donation 頁面（避免被當純文字）
app.get(["/add-donation", "/add-donation.html"], (req, res) => {
  res.type("html");
  res.sendFile(path.join(__dirname, "add-donation.html"));
});

// ===== 顯示新增捐贈頁面 =====
app.get('/add-donation', (req, res) => {
  res.sendFile(path.join(__dirname, 'add-donation.html'));
});


// 掛上 auth 路由（/api/auth/...）
app.use('/api/auth', authRoutes);

// 掛上 donations 路由（/api/donations/...）⭐ 新增
app.use('/api/donations', donationRoutes);

// Railway 會自己給 PORT（沒有就用 3000）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
