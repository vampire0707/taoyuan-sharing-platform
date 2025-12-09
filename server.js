// server.js
const express = require('express');
const path = require('path');
const app = express();

const authRoutes = require('./routes/auth');

// 讓 Express 可以解析 JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態檔案（index.html / login.html / register.html / JS / CSS）
app.use(express.static(__dirname));

// 掛上 auth 路由（/api/auth/...）
app.use('/api/auth', authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
