// routes/donations.js (ESM)
import express from "express";
import db from "../db.js";

const router = express.Router();

// ===============================
// AI/NLP baseline classifier (no external API)
// Returns ONLY categories that exist in add-donation.html select:
// food, clothes, books, furniture, household, others
// ===============================
function classifyDonation(item_name = "", description = "") {
  const text = `${item_name} ${description}`.toLowerCase();

  const rules = [
    {
      category: "food",
      keywords: [
        "food", "snack", "cookie", "instant", "noodle", "rice", "tea", "drink", "milk",
        "咖啡", "茶", "餅乾", "泡麵", "米", "飲料", "零食", "食品", "糖果", "巧克力", "罐頭"
      ],
    },
    {
      category: "clothes",
      keywords: [
        "shirt", "tshirt", "coat", "jacket", "pants", "jeans", "dress", "hoodie", "shoe", "shoes",
        "襪", "衣", "外套", "褲", "鞋", "帽", "衣服", "羽絨", "毛衣", "裙", "上衣"
      ],
    },
    {
      category: "books",
      keywords: [
        "book", "textbook", "note", "stationery", "pen", "pencil", "paper",
        "書", "課本", "筆記", "文具", "筆", "紙", "講義", "參考書", "小說", "漫畫"
      ],
    },
    {
      category: "furniture",
      keywords: [
        "chair", "table", "bed", "sofa", "lamp", "cabinet", "fan", "mattress",
        "椅", "桌", "床", "沙發", "燈", "櫃", "電扇", "家具", "家電", "書桌", "衣櫃", "檯燈"
      ],
    },
    {
      // household includes: daily用品 + 3C + baby + medical + pet (to match your UI)
      category: "household",
      keywords: [
        // daily
        "tissue", "toothpaste", "soap", "shampoo", "detergent", "clean", "mask",
        "衛生紙", "牙膏", "肥皂", "洗髮", "清潔", "洗衣", "口罩", "日用品",
        // 3C
        "phone", "iphone", "android", "laptop", "pc", "keyboard", "mouse", "earphone", "charger", "usb",
        "電腦", "筆電", "手機", "充電", "耳機", "鍵盤", "滑鼠", "3c", "轉接頭", "延長線",
        // baby
        "baby", "diaper", "formula", "stroller", "奶粉", "尿布", "嬰兒", "推車",
        // medical
        "medicine", "vitamin", "bandage", "first aid", "藥", "維他命", "ok繃", "醫療", "保健",
        // pet
        "pet", "dog", "cat", "litter", "寵物", "狗", "貓", "飼料", "貓砂"
      ],
    },
  ];

  // scoring: count keyword hits
  let best = { category: "others", score: 0, hits: [] };

  for (const r of rules) {
    const hits = r.keywords.filter((k) => text.includes(k));
    const score = hits.length;
    if (score > best.score) best = { category: r.category, score, hits };
  }

  // confidence mapping for stable demo
  let confidence = 0.35;
  if (best.score === 1) confidence = 0.65;
  else if (best.score === 2) confidence = 0.78;
  else if (best.score >= 3) confidence = 0.9;

  const reason =
    best.category === "others"
      ? "No strong keywords matched; default to others."
      : `Matched keywords: ${best.hits.slice(0, 5).join(", ")}`;

  return { category: best.category, confidence, reason };
}

function requireLogin(req, res, next) {
  const uid = Number(req.headers["x-user-id"]);
  if (!uid) return res.status(401).json({ message: "Not logged in" });
  req.userId = uid;
  next();
}

// ===============================
// classify (demo endpoint)
// POST /api/donations/classify
// ===============================
router.post("/classify", (req, res) => {
  const { item_name = "", description = "" } = req.body || {};
  const result = classifyDonation(item_name, description);
  res.json(result);
});

// ===============================
// leaderboard
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
// list
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
// create
// POST /api/donations
// ===============================
router.post("/", async (req, res) => {
  try {
    const {
      donor_id,
      item_name,
      quantity,
      area,
      description,
      image_url,
      pickup_location,

      // optional from frontend
      category,
      ai_confidence,
      ai_reason,
    } = req.body;

    if (!donor_id || !item_name || !quantity) {
      return res.status(400).json({ message: "donor_id、item_name、quantity 為必填" });
    }

    // If frontend didn't provide AI result, auto-classify here (demo stability)
    const ai =
      category || ai_confidence || ai_reason
        ? {
            category: category || null,
            confidence: ai_confidence != null ? Number(ai_confidence) : null,
            reason: ai_reason || null,
          }
        : classifyDonation(item_name, description || "");

    // 防呆：只允許前端存在的類別
    const allowed = new Set(["food", "clothes", "books", "furniture", "household", "others"]);
    if (ai.category && !allowed.has(ai.category)) ai.category = "others";

    const [result] = await db.query(
      `
      INSERT INTO donations
      (donor_id, item_name, amount, area, description, image_url, pickup_location, category, ai_confidence, ai_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        Number(donor_id),
        item_name,
        Number(quantity),
        area || null,
        description || null,
        image_url || null,
        pickup_location || null,
        ai.category || null,
        ai.confidence != null ? Number(ai.confidence) : null,
        ai.reason || null,
      ]
    );

    res.status(201).json({
      message: "捐贈商品建立成功",
      donationId: result.insertId,
      ai: ai, // demo: return AI result too
    });
  } catch (err) {
    console.error("新增捐贈商品錯誤：", err);
    res.status(500).json({ message: "資料庫錯誤，請稍後再試" });
  }
});

// ===============================
// mine
// ===============================
router.get("/mine", requireLogin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT donation_id, donor_id, item_name, amount, area, pickup_location, image_url, description, created_at,
             category, ai_confidence, ai_reason
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
// update
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
// delete
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

export default router;
