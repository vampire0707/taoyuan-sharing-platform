// db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: '127.0.0.1',      // 建議用 127.0.0.1 比 localhost 穩
  user: 'root',           // 你的 MySQL 帳號
  password: '',   // 你的 MySQL 密碼
  database: 'donation_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();   // 之後用 async/await
