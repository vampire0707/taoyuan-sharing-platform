import express from "express";
import pool from "../db.js"; // 若 db.js 不是 default export，改成：import { pool } from "../db.js";

const router = express.Router();
console.log("✅ LOADED routes/requests.js v2", new Date().toISOString());


// 測試：確認這支 router 真的有被載入
router.get("/ping", (req, res) => res.json({ ok: true, route: "requests" }));

// ===============================
// POST /api/requests
// body: { donation_id, requester_id }
// ===============================
router.post("/", async (req, res) => {
  try {
    const { donation_id, requester_id } = req.body;

    if (!donation_id || !requester_id) {
      return res.status(400).json({ message: "donation_id and requester_id are required" });
    }

    // donation 是否存在 & 抓 donor
    const [donRows] = await pool.query(
      "SELECT donation_id, donor_id, item_name FROM donations WHERE donation_id = ?",
      [donation_id]
    );
    if (donRows.length === 0) return res.status(404).json({ message: "Donation not found" });

    // 不可申請自己的物品
    if (Number(donRows[0].donor_id) === Number(requester_id)) {
      return res.status(400).json({ message: "You cannot request your own item" });
    }

    // 是否已申請過
    const [exist] = await pool.query(
      "SELECT request_id FROM requests WHERE donation_id = ? AND requester_id = ? LIMIT 1",
      [donation_id, requester_id]
    );
    if (exist.length > 0) {
      return res.status(409).json({ message: "You already requested this item" });
    }

    // 寫入 requests
    const [result] = await pool.query(
      "INSERT INTO requests (donation_id, requester_id, status) VALUES (?, ?, 'pending')",
      [donation_id, requester_id]
    );

    return res.json({ ok: true, request_id: result.insertId, status: "pending" });
  } catch (err) {
    console.error("POST /api/requests error:", err);
    return res.status(500).json({
      message: "Server error",
      error: String(err?.message || err),
    });
  }
});

// ===============================
// GET /api/requests/me/claims?user_id=2
// 申請者看到：我申請過哪些（claims）
// ===============================
router.get("/me/claims", async (req, res) => {
  try {
    const userId = Number(req.query.user_id || req.headers["x-user-id"]);
    if (!userId) return res.status(400).json({ message: "user_id is required" });

    const [rows] = await pool.query(
      `
      SELECT
        r.request_id,
        r.status,
        r.created_at,
        d.donation_id,
        d.item_name,
        d.area,
        d.pickup_location,
        d.image_url,
        d.donor_id,
        u.username AS donor_name
      FROM requests r
      JOIN donations d ON d.donation_id = r.donation_id
      LEFT JOIN users u ON u.user_id = d.donor_id
      WHERE r.requester_id = ?
      ORDER BY r.created_at DESC
      `,
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("GET /api/requests/me/claims error:", err);
    return res.status(500).json({
      message: "Server error",
      error: String(err?.message || err),
    });
  }
});

// ===============================
// GET /api/requests/me/item-requests?user_id=1
// 捐贈者看到：別人對我的物資提出的申請
// ===============================
router.get("/me/item-requests", async (req, res) => {
  try {
    const userId = Number(req.query.user_id || req.headers["x-user-id"]);
    if (!userId) return res.status(400).json({ message: "user_id is required" });

    const [rows] = await pool.query(
      `
      SELECT
        r.request_id,
        r.status,
        r.created_at,
        d.donation_id,
        d.item_name,
        d.area,
        d.pickup_location,
        d.image_url,
        r.requester_id,
        u.username AS requester_name
      FROM donations d
      JOIN requests r ON r.donation_id = d.donation_id
      LEFT JOIN users u ON u.user_id = r.requester_id
      WHERE d.donor_id = ?
      ORDER BY r.created_at DESC
      `,
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("GET /api/requests/me/item-requests error:", err);
    return res.status(500).json({
      message: "Server error",
      error: String(err?.message || err),
    });
  }
});

// ===============================
// PATCH /api/requests/:requestId
// body: { status: "approved" | "rejected" | "pending" }
// ===============================
router.patch("/:requestId", async (req, res) => {
  try {
    const requestId = Number(req.params.requestId);
    const { status } = req.body;

    console.log("✅ PATCH /api/requests/:id", { requestId, status });

    const allowed = new Set(["approved", "rejected", "pending"]);
    if (!requestId) return res.status(400).json({ message: "Invalid requestId" });
    if (!allowed.has(status)) return res.status(400).json({ message: "Invalid status" });

    const [result] = await pool.query(
      "UPDATE requests SET status = ? WHERE request_id = ?",
      [status, requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    return res.json({ ok: true, affectedRows: result.affectedRows });
  } catch (err) {
    console.error("PATCH /api/requests/:id error:", err);
    return res.status(500).json({
      message: "Server error",
      error: String(err?.message || err),
      code: err?.code,
      sqlState: err?.sqlState,
    });
  }
});

export default router;
