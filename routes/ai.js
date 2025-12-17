import express from "express";
import OpenAI from "openai";

const router = express.Router();

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const client = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });

// ✅ 和你前端 <select> value 對齊（很重要）
const ALLOWED_CATEGORIES = [
  "food",
  "daily_necessities",
  "clothes",
  "3c",
  "books",
  "baby",
  "medical",
  "furniture",
  "other",
];

// 測試：確認路由活著
router.get("/ping", (req, res) => {
  res.json({ ok: true, msg: "ai router alive" });
});

// 正式：AI 分類
router.post("/classify", async (req, res) => {
  try {
    const { item_name = "", description = "" } = req.body || {};
    const text = `${item_name}\n${description}`.trim();
    if (!text) return res.status(400).json({ ok: false, error: "item_name/description required" });

    const response = await client.responses.create({
  model: "gpt-5",
  instructions: [
    "You are an assistant for a donation website.",
    "Return JSON only (no markdown).",
    "Keys: category, confidence, scam_risk, risk_reasons, normalized_title.",
    "category must be one of the allowed categories exactly.",
    "confidence must be 0..1.",
    "scam_risk must be low/medium/high.",
    "risk_reasons must be an array (max 5).",
    "If unsure, category=other with low confidence."
  ].join("\n"),
  input: [
    "Donation item info:",
    `item_name: ${item_name}`,
    `description: ${description}`,
    "",
    `Allowed categories: ${ALLOWED_CATEGORIES.join(", ")}`
  ].join("\n"),

  // ✅ 新版：用 text.format 取代 response_format
        text: {
            format: {
            type: "json_schema",
            name: "donation_classification",
            strict: true,
            schema: {
                type: "object",
                additionalProperties: false,
                required: ["category", "confidence", "scam_risk", "risk_reasons", "normalized_title"],
                properties: {
                category: { type: "string", enum: ALLOWED_CATEGORIES },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                scam_risk: { type: "string", enum: ["low", "medium", "high"] },
                risk_reasons: { type: "array", items: { type: "string" }, maxItems: 5 },
                normalized_title: { type: "string", minLength: 1, maxLength: 80 }
                }
            }
            }
        }
        });


    const data = JSON.parse(response.output_text);
    return res.json({ ok: true, ...data });

  } catch (err) {
    console.error("[AI classify] error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "AI classify failed" });
  }
});

export default router;
