// routes/users.js (ESM)
import express from "express";
import db from "../db.js";

const router = express.Router();

function requireUser(req, res, next) {
  const id = Number(req.headers["x-user-id"]);
  if (!id) return res.status(401).json({ message: "Not logged in" });
  req.userId = id;
  next();
}

// 取得個人資料
router.get("/me", requireUser, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         user_id,
         username,
         phone,
         address,
         bio
       FROM users
       WHERE user_id=?`,
      [req.userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("GET /users/me error:", err);
    res.status(500).json({ message: "DB error" });
  }
});

// 更新個人資料
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

// 個人統計
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

export default router;
