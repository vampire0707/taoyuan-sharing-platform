// login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  const API_BASE = "https://taoyuan-donation-web-production.up.railway.app";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const email = emailInput ? emailInput.value : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
      alert("❌ 請輸入電子郵件與密碼。");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,   // 後端是用 username 收，但你這裡填 email
          password: password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(
          "❌ Cannot connect to server, please try again later.\n" +
          `❌ 登入失敗：${data.message || "請稍後再試。"}`
        );
        console.error("登入錯誤：", data);
        return;
      }

      // ✅ 成功登入（中英文一起顯示）
      alert(
        `💚 Welcome back, ${data.user?.username || email}!\n` +
        `💚 歡迎回來，${data.user?.username || email}！`
      );

      console.log("登入成功：", data);
      form.reset();
    } catch (err) {
      console.error("無法連線到伺服器：", err);
      alert(
        "❌ Cannot connect to server, please try again later.\n" +
        "❌ 無法連線到伺服器，請稍後再試。"
      );
    }
  });
});
