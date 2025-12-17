// db.js (ESM)
import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

function pick(...keys) {
  for (const k of keys) {
    const v = process.env[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return null;
}

// ✅ 1) Railway 常用：MYSQL_URL / MYSQL_PUBLIC_URL / MYSQL_URL
const mysqlUrl = pick("MYSQL_URL", "MYSQL_PUBLIC_URL", "MYSQLPRIVATE_URL", "MYSQLDATABASE_URL", "DATABASE_URL");

// ✅ 2) 走參數：Railway 的 MYSQLHOST/MYSQLUSER/... 或你原本 DB_HOST/DB_USER/...
const host = pick("MYSQLHOST", "DB_HOST");
const user = pick("MYSQLUSER", "DB_USER");
const password = pick("MYSQLPASSWORD", "DB_PASSWORD");
const database = pick("MYSQLDATABASE", "MYSQL_DATABASE", "DB_NAME");
const portRaw = pick("MYSQLPORT", "DB_PORT");

let pool;

if (mysqlUrl) {
  // mysql://user:pass@host:port/db
  pool = mysql.createPool(mysqlUrl);
} else {
  if (!host || !user || !database) {
    throw new Error(
      `[DB] Missing env vars. Provide MYSQL_URL (recommended) OR ` +
      `MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE (or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME).`
    );
  }

  pool = mysql.createPool({
    host,
    user,
    password: password || "",
    database,
    port: Number(portRaw || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

export default pool;
