// db.js (ESM)
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// 本機用 .env，Railway 沒有也沒關係
dotenv.config();

function createPool() {
  // Railway / 雲端：直接用 MYSQL_URL（最穩）
  if (process.env.MYSQL_URL) {
    console.log("[DB] Using MYSQL_URL");
    return mysql.createPool(process.env.MYSQL_URL);
  }

  // 本機 fallback
  const host = process.env.DB_HOST || process.env.MYSQLHOST;
  const user = process.env.DB_USER || process.env.MYSQLUSER;
  const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD;
  const database = process.env.DB_NAME || process.env.MYSQLDATABASE;
  const port = Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306);

  if (!host || !user || !password || !database) {
    throw new Error(
      "[DB] Missing env vars. Need MYSQL_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME"
    );
  }

  console.log("[DB] Using discrete MySQL env vars");
  return mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
  });
}

const pool = createPool();

export default pool;
