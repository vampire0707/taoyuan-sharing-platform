// profile.js
document.addEventListener("DOMContentLoaded", () => {
  // 從 localStorage 讀取登入資訊
  const userJson = localStorage.getItem("tsc_user"); // tsc = Taoyuan Sharing Community
  if (!userJson) {
    // 沒登入，直接踢回登入頁
    alert("請先登入帳號。");
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(userJson);

  // 顯示使用者資料
  const welcomeText = document.getElementById("welcome-text");
  const emailSpan = document.getElementById("user-email");
  const identitySpan = document.getElementById("user-identity");

  if (welcomeText) {
    welcomeText.textContent = `歡迎回來，${user.username}！`;
  }
  if (emailSpan) {
    emailSpan.textContent = user.username;
  }
  if (identitySpan) {
    identitySpan.textContent = user.identity === "yzu_student"
      ? "元智大學學生"
      : "一般會員";
  }

  // 登出按鈕：清除 localStorage + 回登入頁
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("tsc_user");
      alert("您已成功登出。");
      window.location.href = "login.html";
    });
  }
});
