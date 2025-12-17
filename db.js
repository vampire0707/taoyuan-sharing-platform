// db.js (ESM)
import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

if (!process.env.MYSQL_URL) {
  throw new Error("[DB] Missing MYSQL_URL (set it in Railway Variables).");
}

const pool = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
