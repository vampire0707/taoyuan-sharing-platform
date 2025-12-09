// routes/donations.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/donations  新增一筆捐贈商品
router.post('/', async (req, res) => {
  try {
    const {
      donor_id,        // 捐贈者 ID（先從前端傳，之後可以改成從登入狀態抓）
      item_name,       // 物品名稱
      quantity,        // 數量
      area,            // 地區
      description,     // 描述
      image_url,       // 圖片網址
      pickup_location  // 取貨地點
    } = req.body;

    // 簡單驗證必填欄位
    if (!donor_id || !item_name || !quantity) {
      return res.status(400).json({
        message: 'donor_id、item_name、quantity 為必填'
      });
    }

    const [result] = await db.query(
      `INSERT INTO donations
       (donor_id, item_name, quantity, area, description, image_url, pickup_location)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        donor_id,
        item_name,
        Number(quantity),
        area || null,
        description || null,
        image_url || null,
        pickup_location || null
      ]
    );

    res.status(201).json({
      message: '捐贈商品建立成功',
      donationId: result.insertId
    });
  } catch (err) {
    console.error('新增捐贈商品錯誤：', err);
    res.status(500).json({ message: '資料庫錯誤，請稍後再試' });
  }
});

// GET /api/donations  取得所有捐贈商品列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, u.username
       FROM donations d
       LEFT JOIN users u ON d.donor_id = u.user_id
       ORDER BY d.donation_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('取得捐贈列表錯誤：', err);
    res.status(500).json({ message: '資料庫錯誤，請稍後再試' });
  }
});

module.exports = router;
