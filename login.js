// login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");

    const username = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!username || !password) {
      alert("❌ 請輸入完整的帳號與密碼。");
      return;
    }

    try {
      const res = await fetch(
        "https://taoyuan-donation-web-production.up.railway.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert("❌ 登入失敗：" + (data.message || "請稍後再試。"));
        console.error("登入錯誤：", data);
        return;
      }

      // ✅ 登入成功：把使用者資料存到 localStorage
      // 後端回傳格式：
      // {
      //   message: 'Login success',
      //   user: { id, username, identity }
      // }
      localStorage.setItem("tsc_user", JSON.stringify(data.user));

      alert(
        `💚 Login success, welcome back ${data.user.username}!\n` +
        `💚 登入成功，歡迎回來，${data.user.username}！`
      );

      // 轉跳到會員專區
      window.location.href = "profile.html";

    } catch (err) {
      console.error("無法連線到伺服器：", err);
      alert("❌ Cannot connect to server, please try again later.\n❌ 無法連線到伺服器，請稍後再試。");
    }
  });
});
