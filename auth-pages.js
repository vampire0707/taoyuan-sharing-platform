// auth-pages.js
// Works for BOTH login.html and register.html
// Requires: /i18n.js (optional but supported)

function $(id) {
  return document.getElementById(id);
}

function setMsg(text, ok = false) {
  const el = $("msg");
  if (!el) return;
  el.textContent = text || "";
  el.style.color = ok ? "#7CFCB2" : "#ffb4a2";
}

function saveUserToLocalStorage(user) {
  // IMPORTANT: profile.js expects user.user_id
  localStorage.setItem("user", JSON.stringify({
    user_id: user.user_id,
    username: user.username,
    identity: user.identity
  }));
}

function applyAuthPageI18n() {
  if (!window.i18n) return;
  window.i18n.applyLang(window.i18n.getLang());

  const btn = $("langToggle");
  if (btn) {
    btn.onclick = () => {
      const cur = window.i18n.getLang();
      const next = cur === "zh" ? "en" : "zh";
      window.i18n.setLang(next);
      window.i18n.applyLang(next);
    };
  }
}

async function handleLogin(e) {
  e.preventDefault();
  setMsg("");

  const username = String($("login_username")?.value || "").trim();
  const password = String($("login_password")?.value || "");

  if (!username || !password) {
    setMsg(window.i18n ? window.i18n.t("fill_all_fields") : "Please fill in all fields.");
    return;
  }

  setMsg(window.i18n ? window.i18n.t("logging_in") : "Logging in...", true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Login failed");

    if (!data?.user?.user_id) throw new Error("Login success but missing user_id");

    saveUserToLocalStorage(data.user);

    setMsg(window.i18n ? window.i18n.t("login_success") : "✅ Login success!", true);

    // redirect
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 450);
  } catch (err) {
    console.error(err);
    setMsg("❌ " + (err.message || "Login failed"));
  }
}

async function handleRegister(e) {
  e.preventDefault();
  setMsg("");

  const username = String($("reg_username")?.value || "").trim();
  const password = String($("reg_password")?.value || "");

  // optional fields (if you add them later)
  const identity = $("reg_identity") ? String($("reg_identity").value || "").trim() : "external";
  const student_id = $("reg_student_id") ? String($("reg_student_id").value || "").trim() : null;

  if (!username || !password) {
    setMsg(window.i18n ? window.i18n.t("fill_all_fields") : "Please fill in all fields.");
    return;
  }

  setMsg(window.i18n ? window.i18n.t("registering") : "Registering...", true);

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        identity: identity || "external",
        student_id: student_id || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Register failed");

    setMsg(window.i18n ? window.i18n.t("register_success_login") : "✅ Register success! Please login.", true);

    setTimeout(() => {
      window.location.href = "/login.html";
    }, 650);
  } catch (err) {
    console.error(err);
    setMsg("❌ " + (err.message || "Register failed"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // i18n
  applyAuthPageI18n();

  // bind forms
  $("loginPageForm")?.addEventListener("submit", handleLogin);
  $("registerPageForm")?.addEventListener("submit", handleRegister);

  // quick debug
  // console.log("DEBUG localStorage user:", localStorage.getItem("user"));
});
