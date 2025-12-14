const API_BASE = "";

function setLoggedInUser(userObj) {
  localStorage.setItem("user", JSON.stringify(userObj));
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginPageForm");
  const regForm = document.getElementById("registerPageForm");
  const msg = document.getElementById("msg");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (msg) msg.textContent = "";

      const username = document.getElementById("login_username").value.trim();
      const password = document.getElementById("login_password").value;

      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");

        setLoggedInUser(data.user);
        window.location.href = "/";
      } catch (err) {
        if (msg) msg.textContent = "❌ " + err.message;
      }
    });
  }

  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (msg) msg.textContent = "";

      const username = document.getElementById("reg_username").value.trim();
      const password = document.getElementById("reg_password").value;

      try {
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

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Register failed");

        window.location.href = "/login.html";
      } catch (err) {
        if (msg) msg.textContent = "❌ " + err.message;
      }
    });
  }
});
