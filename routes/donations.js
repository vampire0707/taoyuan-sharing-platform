// routes/donations.js (CommonJS)
const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ 簡單登入保護（先用 x-user-id）
// 前端請送：headers: { "x-user-id": user.user_id }
function requireLogin(req, res, next) {
  const uid = Number(req.headers["x-user-id"]);
  if (!uid) return res.status(401).json({ message: "Not logged in" });
  req.userId = uid;
  next();
}

// ===============================
// GET /api/donations/leaderboard
// ===============================
router.get("/leaderboard", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        u.user_id,
        u.username,
        COUNT(d.donation_id) AS listings,
        COALESCE(SUM(d.amount), 0) AS total_amount,
        (COALESCE(SUM(d.amount), 0) * 10) AS xp
      FROM users u
      LEFT JOIN donations d ON d.donor_id = u.user_id
      GROUP BY u.user_id, u.username
      ORDER BY xp DESC, total_amount DESC, listings DESC, u.user_id ASC
      LIMIT 10
      `
    );
    res.json(rows);
  } catch (err) {
    console.error("取得排行榜錯誤：", err);
    res.status(500).json({ message: "資料庫錯誤，請稍後再試" });
  }
});

// ===============================
// GET /api/donations  取得所有捐贈商品列表
// ===============================
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT d.*, u.username
      FROM donations d
      LEFT JOIN users u ON d.donor_id = u.user_id
      ORDER BY d.donation_id DESC
      `
    );
    res.json(rows);
  } catch (err) {
    console.error("取得捐贈列表錯誤：", err);
    res.status(500).json({ message: "資料庫錯誤，請稍後再試" });
  }
});

// ===============================
// POST /api/donations  新增一筆捐贈商品
// 你前端送 quantity，我這裡寫入 amount
// ===============================
router.post("/", async (req, res) => {
  try {
    const { donor_id, item_name, quantity, area, description, image_url, pickup_location } = req.body;

    if (!donor_id || !item_name || !quantity) {
      return res.status(400).json({ message: "donor_id、item_name、quantity 為必填" });
    }

    const [result] = await db.query(
      `
      INSERT INTO donations
      (donor_id, item_name, amount, area, description, image_url, pickup_location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        Number(donor_id),
        item_name,
        Number(quantity),
        area || null,
        description || null,
        image_url || null,
        pickup_location || null,
      ]
    );

    res.status(201).json({ message: "捐贈商品建立成功", donationId: result.insertId });
  } catch (err) {
    console.error("新增捐贈商品錯誤：", err);
    res.status(500).json({ message: "資料庫錯誤，請稍後再試" });
  }
});

// ===============================
// ✅ GET /api/donations/mine 取得我上架的
// ===============================
router.get("/mine", requireLogin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT donation_id, donor_id, item_name, amount, area, pickup_location, image_url, description, created_at
      FROM donations
      WHERE donor_id=?
      ORDER BY donation_id DESC
      `,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("取得我的商品錯誤：", err);
    res.status(500).json({ message: "資料庫錯誤，請稍後再試" });
  }
});

// ===============================
// ✅ PUT /api/donations/:id 更新我上架的商品
// ===============================
router.put("/:id", requireLogin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { item_name, amount, area, pickup_location, image_url, description } = req.body;

    const [own] = await db.query(
      "SELECT donation_id FROM donations WHERE donation_id=? AND donor_id=?",
      [id, req.userId]
    );
    if (!own.length) return res.status(403).json({ message: "No permission" });

    await db.query(
      `
      UPDATE donations
      SET item_name=?, amount=?, area=?, pickup_location=?, image_url=?, description=?
      WHERE donation_id=? AND donor_id=?
      `,
      [
        item_name ?? "",
        Number(amount) || 1,
        area ?? "",
        pickup_location ?? "",
        image_url ?? null,
        description ?? null,
        id,
        req.userId,
      ]
    );

    res.json({ message: "Donation updated" });
  } catch (err) {
    console.error("更新商品錯誤：", err);
    res.status(500).json({ message: "資料庫錯誤，請稍後再試" });
  }
});

// ===============================
// ✅ DELETE /api/donations/:id 刪除我上架的商品
// ===============================
router.delete("/:id", requireLogin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [own] = await db.query(
      "SELECT donation_id FROM donations WHERE donation_id=? AND donor_id=?",
      [id, req.userId]
    );
    if (!own.length) return res.status(403).json({ message: "No permission" });

    await db.query("DELETE FROM donations WHERE donation_id=? AND donor_id=?", [id, req.userId]);
    res.json({ message: "Donation deleted" });
  } catch (err) {
    console.error("刪除商品錯誤：", err);
    res.status(500).json({ message: "資料庫錯誤，請稍後再試" });
  }
});

module.exports = router;
