// auth-pages.js
const API_BASE = ""; // 同網域就留空；如果前端在 GitHub Pages、後端在 Railway，這裡要改成後端網址

function setMsg(el, text, isError = false) {
  if (!el) return;
  el.textContent = text || "";
  el.style.color = isError ? "#b00020" : "#1b5e20";
}

function setLoggedInUser(userObj) {
  localStorage.setItem("user", JSON.stringify(userObj));
}

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
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
    body: JSON.stringify({
      username,
      password,
      identity: "external",
      student_id: null,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Register failed");
  return data;
}

document.addEventListener("DOMContentLoaded", () => {
  // ===== Login Page =====
  const loginForm = document.getElementById("loginPageForm");
  if (loginForm) {
    const uEl = document.getElementById("login_username");
    const pEl = document.getElementById("login_password");
    const msgEl = document.getElementById("msg");

    const existing = getLoggedInUser();
    if (existing) {
      setMsg(msgEl, `Already logged in as ${existing.username || ""}.`);
    }

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = uEl?.value?.trim();
      const password = pEl?.value;

      if (!username || !password) {
        setMsg(msgEl, "Please fill in all fields.", true);
        return;
      }

      try {
        setMsg(msgEl, "Logging in...");
        const user = await apiLogin(username, password);
        setLoggedInUser(user);

        setMsg(msgEl, "✅ Login success!");
        // 登入成功導回首頁
        window.location.href = "/index.html";
      } catch (err) {
        setMsg(msgEl, err.message || "Login failed", true);
      }
    });

    return; // 避免跟 register 同時綁
  }

  // ===== Register Page =====
  const regForm = document.getElementById("registerPageForm");
  if (regForm) {
    const uEl = document.getElementById("reg_username");
    const pEl = document.getElementById("reg_password");
    const msgEl = document.getElementById("msg");

    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = uEl?.value?.trim();
      const password = pEl?.value;

      if (!username || !password) {
        setMsg(msgEl, "Please fill in all fields.", true);
        return;
      }

      try {
        setMsg(msgEl, "Registering...");
        await apiRegister(username, password);

        setMsg(msgEl, "✅ Register success! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login.html";
        }, 500);
      } catch (err) {
        setMsg(msgEl, err.message || "Register failed", true);
      }
    });
  }
});
