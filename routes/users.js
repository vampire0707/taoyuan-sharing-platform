// routes/users.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ 簡易登入判斷（先用 localStorage 的 user_id 送來）
// 前端請在 fetch 時帶 header: x-user-id
function requireUser(req, res, next) {
  const id = Number(req.headers["x-user-id"]);
  if (!id) return res.status(401).json({ message: "Not logged in" });
  req.userId = id;
  next();
}

// 取得我的資料
router.get("/me", requireUser, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT user_id, username, email,
              phone, address, bio
       FROM users
       WHERE user_id=?`,
      [req.userId]
    );
    if (!rows.length) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /users/me error:", err);
    res.status(500).json({ message: "DB error" });
  }
});

// 更新我的資料（電話/地址/自介）
router.put("/me", requireUser, async (req, res) => {
  try {
    const { phone, address, bio } = req.body;

    await db.query(
      `UPDATE users
       SET phone=?, address=?, bio=?
       WHERE user_id=?`,
      [phone || null, address || null, bio || null, req.userId]
    );

    res.json({ message: "Profile updated" });
  } catch (err) {
    console.error("PUT /users/me error:", err);
    res.status(500).json({ message: "DB error" });
  }
});

// 我的統計（XP / 總上架數 / 總數量）
router.get("/me/stats", requireUser, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         COUNT(*) AS listings,
         COALESCE(SUM(amount),0) AS total_qty,
         (COALESCE(SUM(amount),0) * 10) AS xp
       FROM donations
       WHERE donor_id=?`,
      [req.userId]
    );
    res.json(rows[0] || { listings: 0, total_qty: 0, xp: 0 });
  } catch (err) {
    console.error("GET /users/me/stats error:", err);
    res.status(500).json({ message: "DB error" });
  }
});

module.exports = router;
