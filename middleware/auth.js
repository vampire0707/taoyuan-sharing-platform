// routes/auth.js (ESM)
import express from "express";
import bcrypt from "bcrypt";
import db from "../db.js";

const router = express.Router();

// =======================
//  POST /api/auth/register
// =======================
router.post("/register", async (req, res) => {
  try {
    const { username, password, identity, student_id } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Account already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (username, password, identity, student_id)
       VALUES (?, ?, ?, ?)`,
      [username, hashed, identity || "external", student_id || null]
    );

    return res.status(201).json({
      message: "Register success",
      user: {
        user_id: result.insertId,
        username,
        identity: identity || "external",
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// =======================
//  POST /api/auth/login
// =======================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const [rows] = await db.query(
      "SELECT user_id, username, password, identity FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found." });
    }

    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    return res.json({
      message: "Login success",
      user: {
        user_id: user.user_id,
        username: user.username,
        identity: user.identity,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
