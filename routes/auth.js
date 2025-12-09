// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

// =======================
//  POST /api/auth/register
// =======================
router.post('/register', async (req, res) => {
  try {
    const { username, password, identity, student_id } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // 1. 檢查帳號是否已存在
    const [existing] = await db.query(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Account already exists.' });
    }

    // 2. 密碼加密（bcrypt）
    const hashed = await bcrypt.hash(password, 10);

    // 3. 寫入 users 資料表
    const [result] = await db.query(
      `INSERT INTO users (username, password, identity, student_id)
       VALUES (?, ?, ?, ?)`,
      [
        username,
        hashed,
        identity || 'external',    // 沒傳就先當 external
        student_id || null,
      ]
    );

    return res.status(201).json({
      message: 'Register success',
      userId: result.insertId,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// =======================
//  POST /api/auth/login
// =======================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body; // 前端用 email 當 username 傳上來

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // 1. 找使用者
    const [rows] = await db.query(
      'SELECT user_id, username, password, identity FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const user = rows[0];

    // 2. 比對密碼（bcrypt.compare）
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // 3. 登入成功：先回傳基本資訊（之後要做 JWT 可以再加）
    return res.json({
      message: 'Login success',
      user: {
        id: user.user_id,
        username: user.username,
        identity: user.identity,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
