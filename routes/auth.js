// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();

// 註冊
router.post('/register', async (req, res) => {
  console.log("📩 /api/auth/register 收到 body:", req.body);
  const { username, password, identity, student_id } = req.body;

  try {
    // 1. 檢查帳號是否已存在
    const [check] = await pool.query(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );
    if (check.length > 0) {
      return res.status(400).json({ message: '帳號已存在' });
    }

    // 2. 密碼加密（rounds 10，速度OK）
    const hash = await bcrypt.hash(password, 10);

    // 3. 寫入資料庫
    const [result] = await pool.query(
      `INSERT INTO users (username, password_hash, identity, student_id)
       VALUES (?, ?, ?, ?)`,
      [username, hash, identity, student_id || null]
    );

    res.json({ message: '註冊成功', user_id: result.insertId });
  } catch (err) {
    console.error('註冊錯誤:', err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 登入
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. 用 username 查使用者
    const [rows] = await pool.query(
      `SELECT user_id, password_hash, identity, points
       FROM users
       WHERE username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: '帳號或密碼錯誤' });
    }

    const user = rows[0];

    // 2. 比對密碼
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: '帳號或密碼錯誤' });
    }

    // 這裡之後可以補 JWT or session
    res.json({
      message: '登入成功',
      user: {
        user_id: user.user_id,
        identity: user.identity,
        points: user.points
      }
    });
  } catch (err) {
    console.error('登入錯誤:', err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;
