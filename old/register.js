// register.js － 前端註冊功能

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  if (!form) return;

  // 自動判斷：本機 or Railway
  const API_BASE =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://taoyuan-donation-web-production.up.railway.app";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("reg-name").value;
    const password = document.getElementById("reg-password").value;
    const area = document.getElementById("reg-area").value;
    const email = document.getElementById("reg-email").value;
    const phone = document.getElementById("reg-phone").value;

    // 後端目前 users 欄位：username / password / identity / student_id
    const payload = {
      username: email,        // 使用 email 當帳號
      password: password,
      identity: "external",
      student_id: null
      // area、phone 目前 DB 沒欄位，就先不送
    };

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert("❌ 註冊失敗：" + (data.message || "未知錯誤") + "\n" +
              "❌ Registration failed: " + (data.message || "Unknown error"));
        console.error("註冊錯誤回應：", data);
        return;
      }

      // ⭐ 成功註冊 → 同時顯示中英文訊息（保留你的需求）
      alert(
        `🩵 Welcome to Taoyuan Sharing Community, ${name}!\n` +
        `🩵 歡迎加入桃園共享社區，${name}！`
      );

      console.log("註冊成功，後端回傳：", data);
      form.reset();

    } catch (err) {
      console.error("無法連線到後端：", err);
      alert(
        "❌ 無法連線到伺服器，請稍後再試。\n" +
        "❌ Cannot connect to server, please try again later."
      );
    }
  });
});
