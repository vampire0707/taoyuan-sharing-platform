// db.js (ESM) - MySQL2 pool for Railway / Local
import mysql from "mysql2/promise";

function must(name, val) {
  if (!val) throw new Error(`[DB] Missing env: ${name}`);
  return val;
}

function buildConfig() {
  // 1) Prefer Railway MYSQL_URL (internal) if present
  const url =
    process.env.MYSQL_URL ||
    process.env.DATABASE_URL || // 有些平台會給 DATABASE_URL
    "";

  if (url) {
    return {
      uri: url,
      connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
      waitForConnections: true,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };
  }

  // 2) Fallback to split vars (Railway provides these too)
  const host = must("MYSQLHOST", process.env.MYSQLHOST);
  const user = must("MYSQLUSER", process.env.MYSQLUSER);
  const password = must("MYSQLPASSWORD", process.env.MYSQLPASSWORD);

  // Railway 有時會同時給 MYSQLDATABASE / MYSQL_DATABASE / MYSQL_DATABASE
  const database =
    process.env.MYSQLDATABASE ||
    process.env.MYSQL_DATABASE ||
    process.env.MYSQL_DATABASE_NAME;

  return {
    host,
    user,
    password,
    database: must("MYSQLDATABASE", database),
    port: Number(process.env.MYSQLPORT || 3306),
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
    waitForConnections: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
}

const cfg = buildConfig();

// ✅ 啟動時印出實際連線目標（部署 debug 很重要）
if (cfg.uri) {
  console.log("[DB] Using URL:", cfg.uri.replace(/\/\/.*?:.*?@/, "//***:***@"));
} else {
  console.log("[DB] Using HOST:", {
    host: cfg.host,
    port: cfg.port,
    database: cfg.database,
    user: cfg.user,
  });
}

const pool = cfg.uri
  ? mysql.createPool(cfg)
  : mysql.createPool(cfg);

export default pool;
