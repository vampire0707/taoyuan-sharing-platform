export function requireLogin(req, res, next) {
  // 方案A：用 header 傳 user-id（前端從 localStorage 拿 user_id）
  const uid = Number(req.headers["x-user-id"]);
  if (!uid) return res.status(401).json({ message: "Not logged in" });
  req.userId = uid;
  next();
}
