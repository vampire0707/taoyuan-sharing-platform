import express from "express";
import pool from "../db.js";
import { requireLogin } from "../middleware/auth.js";

const router = express.Router();

// 取得自己的個人資料
router.get("/me", requireLogin, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT user_id, username, email, phone, address, bio FROM users WHERE user_id=?",
    [req.userId]
  );
  if (!rows.length) return res.status(404).json({ message: "User not found" });
  res.json(rows[0]);
});

// 更新自己的個人資料
router.put("/me", requireLogin, async (req, res) => {
  const { phone, address, bio } = req.body;

  await pool.query(
    "UPDATE users SET phone=?, address=?, bio=? WHERE user_id=?",
    [phone ?? null, address ?? null, bio ?? null, req.userId]
  );

  res.json({ message: "Profile updated" });
});

// 取得自己的統計：上架數、總數量、XP
router.get("/me/stats", requireLogin, async (req, res) => {
  const [rows] = await pool.query(
    `
    SELECT 
      COUNT(*) AS listings,
      COALESCE(SUM(amount),0) AS total_qty,
      COALESCE(SUM(amount),0)*10 AS xp
    FROM donations
    WHERE donor_id=?
    `,
    [req.userId]
  );
  res.json(rows[0] || { listings: 0, total_qty: 0, xp: 0 });
});

export default router;
