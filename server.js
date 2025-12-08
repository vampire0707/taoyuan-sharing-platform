const express = require('express');
const path = require('path');
const app = express();

const authRoutes = require('./routes/auth');

// 讓 Express 可以解析 JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 如果你是用 express 來 serve 靜態檔案（HTML / JS / CSS）
app.use(express.static(__dirname)); // 或指定 public 資料夾

// 掛上 auth 路由
app.use('/api/auth', authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
