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

// ⭐ 開 CORS，讓 127.0.0.1:5500、Railway、GitHub Pages 都可以呼叫
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://taoyuan-donation-web-production.up.railway.app',
    // 之後如果有 GitHub Pages 網域也可以加進來
  ]
}));

// 讓 Express 可以解析 JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態檔案（index.html / login.html / register.html / JS / CSS）
app.use(express.static(__dirname));

// 掛上 auth 路由（/api/auth/...）
app.use('/api/auth', authRoutes);

// 掛上 donations 路由（/api/donations/...）⭐ 新增
app.use('/api/donations', donationRoutes);

// Railway 會自己給 PORT（沒有就用 3000）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
