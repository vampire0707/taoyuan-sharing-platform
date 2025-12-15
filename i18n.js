// i18n.js
const I18N = {
  en: {
    // nav
    "nav-about": "About Us",
    "nav-services": "Services",
    "nav-events": "Events",
    "nav-members": "Members",

    // hero
    "main-title": "Welcome to Taoyuan Sharing Community",
    "main-mission": "Share, Save, Smile — Free Food, Clothes, Books & Useful Items Around You!",

    // sections (orange bars)
    "howto-bar": "✨ How it works",
    "quickaccess-bar": "🔐 Quick Access",
    "home-items-title": "🧡 New Items",
    "about-bar": "🌿 About",
    "services-bar": "🧰 Services",
    "events-bar": "🗺 Events",
    "members-bar": "🏆 Member Ranking (XP)",

    // quick access
    "inline-auth-title": "Login",
    "inline-auth-submit": "Login",
    "inline-switch-text": "Don't have an account?",
    "inline-switch-mode": "Register",

    // static text blocks (optional ids you can add later)
  },

  zh: {
    "nav-about": "關於我們",
    "nav-services": "服務",
    "nav-events": "活動",
    "nav-members": "成員",

    "main-title": "歡迎來到桃園共享社區",
    "main-mission": "分享、節省、微笑——你身邊就有免費的食物、衣服、書籍和實用物品！",

    "howto-bar": "✨ 工作原理",
    "quickaccess-bar": "🔐 快速登入",
    "home-items-title": "🧡 最新上架",
    "about-bar": "🌿 關於我們",
    "services-bar": "🧰 服務",
    "events-bar": "🗺 活動",
    "members-bar": "🏆 成員排行（XP）",

    "inline-auth-title": "線上登入",
    "inline-auth-submit": "登入",
    "inline-switch-text": "還沒有帳號？",
    "inline-switch-mode": "註冊",
  },
};

function getLang() {
  return localStorage.getItem("lang") || "en";
}

function setLang(lang) {
  localStorage.setItem("lang", lang);
}

function applyLang(lang) {
  const dict = I18N[lang] || I18N.en;

  Object.keys(dict).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = dict[id];
  });

  // placeholder（如果你想要也能翻）
  const email = document.getElementById("inline-auth-email");
  const pass = document.getElementById("inline-auth-password");
  if (email) email.placeholder = lang === "zh" ? "Email（帳號）" : "Email (username)";
  if (pass) pass.placeholder = lang === "zh" ? "密碼" : "Password";
}

window.i18n = { getLang, setLang, applyLang };
