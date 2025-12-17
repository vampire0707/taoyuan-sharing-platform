// db.js (ESM)
import mysql from "mysql2/promise";

function maskUrl(u) {
  return String(u || "").replace(/\/\/(.*?):(.*?)@/, "//***:***@");
}

function env(name) {
  return process.env[name];
}

function pickDbName() {
  return env("MYSQLDATABASE") || env("MYSQL_DATABASE") || env("MYSQL_DATABASE_NAME");
}

function buildPoolOptions() {
  // ✅ Railway 同專案內，最穩的是 MYSQL_URL（通常是 mysql.railway.internal:3306）
  const url = env("MYSQL_URL") || env("DATABASE_URL");
  if (url) {
    console.log("[DB] MODE=url");
    console.log("[DB] MYSQL_URL =", maskUrl(url));
    return {
      uri: url,
      connectionLimit: Number(env("DB_POOL_SIZE") || 10),
      waitForConnections: true,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };
  }

  const host = env("MYSQLHOST");
  const user = env("MYSQLUSER");
  const password = env("MYSQLPASSWORD");
  const database = pickDbName();
  const port = Number(env("MYSQLPORT") || 3306);

  if (!host || !user || !password || !database) {
    throw new Error(
      "[DB] Missing env vars. Provide MYSQL_URL (recommended) OR MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE."
    );
  }

  console.log("[DB] MODE=vars");
  console.log("[DB] HOST =", host);
  console.log("[DB] PORT =", port);
  console.log("[DB] DB   =", database);
  console.log("[DB] USER =", user);

  return {
    host,
    user,
    password,
    database,
    port,
    connectionLimit: Number(env("DB_POOL_SIZE") || 10),
    waitForConnections: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
}

const pool = mysql.createPool(buildPoolOptions());

// ✅ 開機測試（不會讓程式崩潰，只印出錯誤）
(async () => {
  try {
    const c = await pool.getConnection();
    await c.ping();
    c.release();
    console.log("[DB] ✅ Connected & ping OK");
  } catch (e) {
    console.error("[DB] ❌ Connect/Ping failed:", e?.code || e?.message, e);
  }
})();

export default pool;
