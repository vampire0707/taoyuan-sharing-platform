// auth-pages.js
// ===============================
// Config (同首頁一致)
// ===============================
const API_BASE =
  (location.hostname === "127.0.0.1" || location.hostname === "localhost") && location.port === "5500"
    ? "http://localhost:3000"
    : "";

// ===============================
// Helpers (同首頁一致)
// ===============================
function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}
function setLoggedInUser(userObj) {
  localStorage.setItem("user", JSON.stringify(userObj));
}
function clearLoggedInUser() {
  localStorage.removeItem("user");
}

async function apiLogin(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data.user;
}

async function apiRegister(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, identity: "external", student_id: null }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Register failed");
  return data;
}

// ===============================
// Page Logic
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const msg = document.getElementById("msg");

  // --- Login Page ---
  const loginForm = document.getElementById("loginPageForm");
  if (loginForm) {
    const uInput = document.getElementById("login_username");
    const pInput = document.getElementById("login_password");

    // 如果已登入，直接顯示「已登入 + 登出」
    const u = getLoggedInUser();
    if (u && msg) {
      msg.innerHTML = `
        ✅ You are already logged in as <strong>${u.username || ""}</strong>.
        <div style="margin-top:10px;">
          <button id="logoutBtn" type="button">Logout</button>
        </div>
      `;
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          clearLoggedInUser();
          location.reload();
        });
      }
    }

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = (uInput?.value || "").trim();
      const password = pInput?.value || "";

      if (!username || !password) {
        if (msg) msg.textContent = "Please fill in all fields.";
        return;
      }

      try {
        if (msg) msg.textContent = "Logging in...";
        const user = await apiLogin(username, password);
        setLoggedInUser(user);

        if (msg) msg.textContent = "✅ Login success! Redirecting...";
        setTimeout(() => {
          window.location.href = "/"; // 回首頁
        }, 350);
      } catch (err) {
        if (msg) msg.textContent = err.message || "Login failed";
      }
    });
  }

  // --- Register Page ---
  const registerForm = document.getElementById("registerPageForm");
  if (registerForm) {
    const uInput = document.getElementById("reg_username");
    const pInput = document.getElementById("reg_password");

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = (uInput?.value || "").trim();
      const password = pInput?.value || "";

      if (!username || !password) {
        if (msg) msg.textContent = "Please fill in all fields.";
        return;
      }

      try {
        if (msg) msg.textContent = "Registering...";
        await apiRegister(username, password);
        if (msg) msg.textContent = "✅ Register success! Redirecting to Login...";
        setTimeout(() => {
          window.location.href = "/login.html";
        }, 500);
      } catch (err) {
        if (msg) msg.textContent = err.message || "Register failed";
      }
    });
  }
});
