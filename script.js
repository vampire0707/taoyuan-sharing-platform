// ===============================
// Config
// ===============================
const API_BASE =
  (location.hostname === "127.0.0.1" || location.hostname === "localhost") && location.port === "5500"
    ? "http://localhost:3000"
    : "";

// ===============================
// Helpers
// ===============================
function T(key) {
  return window.i18n?.t?.(key) || key;
}

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

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ✅ 分類推斷：看 item_name + description
function donationToCategory(d) {
  const text = `${d.item_name || ""} ${d.description || ""}`.toLowerCase();
  const has = (arr) => arr.some((k) => text.includes(k));

  // ✅ 支援 description 前綴標籤：[food] xxxx（最穩）
  const m = text.match(/^\s*\[(food|clothes|books|furniture|household|others)\]/);
  if (m) return m[1];

  if (has(["bread","lunch","snack","fruit","food","rice","meal","apple","banana","麵包","便當","零食","水果","食物"])) return "food";
  if (has(["shirt","jacket","jeans","clothes","dress","衣","外套","褲"])) return "clothes";
  if (has(["book","textbook","novel","書","教材","小說"])) return "books";
  if (has(["desk","chair","table","shelf","furniture","桌","椅","書架","家具"])) return "furniture";
  if (has(["fan","cooker","kitchen","laundry","household","家","鍋","電","洗衣"])) return "household";
  return "others";
}

async function fetchDonations() {
  const res = await fetch(`${API_BASE}/api/donations`);
  if (!res.ok) throw new Error("Failed to fetch donations");
  return await res.json();
}

async function fetchLeaderboard() {
  const res = await fetch(`${API_BASE}/api/donations/leaderboard`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return await res.json();
}

function calcLevelFromXp(xp) {
  const n = Number(xp) || 0;
  return Math.floor(n / 100) + 1;
}

// ✅ 共用：登入（username/email 都送）
async function apiLogin(identifier, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: identifier,
      email: identifier,
      password,
    }),
  });

  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) throw new Error(data?.message || "Login failed");
  return data?.user || data;
}

// ✅ 共用：註冊（username/email 都送）
async function apiRegister(username, email, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      email,
      password,
      identity: "external",
      student_id: null,
    }),
  });

  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) throw new Error(data?.message || "Register failed");
  return data;
}

// ===============================
// DOMContentLoaded
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  // ---------------------------
  // ✅ Smooth scroll (avoid header overlap)
  // ---------------------------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // ---------------------------
  // ✅ Auth status
  // ---------------------------
  const authStatus = document.getElementById("auth-status");

  function renderAuthStatus() {
    const u = getLoggedInUser();
    if (!authStatus) return;

    if (!u) {
      authStatus.textContent = T("you_not_logged_in");
      return;
    }

    authStatus.innerHTML = `
      ${T("logged_in_as")} <strong>${escapeHtml(u.username || u.email || "")}</strong>
      <button id="btn-logout" class="nav-btn" type="button" style="margin-left:10px;">${T("logout")}</button>
    `;

    const btn = document.getElementById("btn-logout");
    if (btn) {
      btn.addEventListener("click", () => {
        clearLoggedInUser();
        renderAuthStatus();
        renderInlineAuthState();
        syncModalAuthState();
        loadHomeNewItems();
        loadLeaderboard();
      });
    }
  }

  // ---------------------------
  // ✅ Homepage: New items list + modal
  // ---------------------------
  const newItemsList = document.getElementById("new-items-list");
  const homeMsg = document.getElementById("home-items-msg");

  const modal = document.getElementById("item-modal");
  const modalClose = document.getElementById("modal-close");
  const mImg = document.getElementById("modal-img");
  const mName = document.getElementById("modal-name");
  const mDesc = document.getElementById("modal-desc");
  const mQty = document.getElementById("modal-qty");
  const mArea = document.getElementById("modal-area");
  const mPickup = document.getElementById("modal-pickup");
  const mDonor = document.getElementById("modal-donor");

  function openModal(d) {
    if (!modal) return;
    const img = d.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?";
    if (mImg) mImg.src = img;
    if (mName) mName.textContent = d.item_name || "";
    if (mDesc) mDesc.textContent = d.description || "(No description)";
    if (mQty) mQty.textContent = d.amount ?? "-";
    if (mArea) mArea.textContent = d.area || "-";
    if (mPickup) mPickup.textContent = d.pickup_location || "-";
    if (mDonor) mDonor.textContent = d.username ? d.username : `User #${d.donor_id ?? "-"}`;
    modal.style.display = "flex";
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  async function loadHomeNewItems() {
    if (!newItemsList) return;
    try {
      if (homeMsg) homeMsg.textContent = T("loading_items");
      const rows = await fetchDonations();
      const list = rows.slice(0, 8);

      newItemsList.innerHTML = "";
      if (list.length === 0) {
        if (homeMsg) homeMsg.textContent = T("no_items");
        return;
      }

      if (homeMsg) homeMsg.textContent = "";

      list.forEach((d) => {
        const li = document.createElement("li");
        const img = d.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?";

        li.innerHTML = `
          <img src="${escapeHtml(img)}" alt="">
          <strong>${escapeHtml(d.item_name)}</strong>
          <span>${escapeHtml(d.area || "-")}</span>
        `;

        li.addEventListener("click", () => openModal(d));
        newItemsList.appendChild(li);
      });
    } catch (err) {
      console.error(err);
      if (homeMsg) homeMsg.textContent = T("fetch_items_failed");
    }
  }

  // ---------------------------
  // ✅ Leaderboard
  // ---------------------------
  const lbBody = document.getElementById("leaderboard-body");
  const lbMsg = document.getElementById("leaderboard-msg");

  async function loadLeaderboard() {
    if (!lbBody) return;
    try {
      if (lbMsg) lbMsg.textContent = T("loading_leaderboard");
      const rows = await fetchLeaderboard();

      lbBody.innerHTML = "";
      if (!rows || rows.length === 0) {
        if (lbMsg) lbMsg.textContent = T("no_data");
        return;
      }

      if (lbMsg) lbMsg.textContent = "";

      rows.forEach((r, idx) => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid rgba(0,0,0,.08)";

        const xp = Number(r.xp) || 0;
        const lvl = calcLevelFromXp(xp);

        tr.innerHTML = `
          <td style="padding:10px;">${idx + 1}</td>
          <td style="padding:10px;"><strong>${escapeHtml(r.username || "-")}</strong></td>
          <td style="padding:10px;">${Number(r.listings) || 0}</td>
          <td style="padding:10px;">${Number(r.total_amount) || 0}</td>
          <td style="padding:10px;">${xp}</td>
          <td style="padding:10px;">Lv.${lvl}</td>
        `;
        lbBody.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      if (lbMsg) lbMsg.textContent = T("leaderboard_failed");
    }
  }

  // ---------------------------
  // ✅ Inline Quick Auth
  // ---------------------------
  const inlineAuthForm = document.getElementById("inline-auth-form");
  const inlineAuthTitle = document.getElementById("inline-auth-title");
  const inlineAuthSubmit = document.getElementById("inline-auth-submit");
  const inlineSwitchMode = document.getElementById("inline-switch-mode");
  const inlineSwitchText = document.getElementById("inline-switch-text");
  const inlineAuthEmail = document.getElementById("inline-auth-email");
  const inlineAuthPassword = document.getElementById("inline-auth-password");
  const inlineLoggedBox = document.getElementById("inline-logged-box");
  const inlineLoggedUser = document.getElementById("inline-logged-user");
  const inlineLogoutBtn = document.getElementById("inline-logout-btn");
  const inlineAuthMsg = document.getElementById("inline-auth-msg");

  let inlineIsRegister = false;

  function renderInlineAuthState() {
    const u = getLoggedInUser();
    if (!inlineAuthForm || !inlineLoggedBox) return;

    if (u) {
      inlineLoggedBox.style.display = "block";
      inlineAuthForm.style.display = "none";
      if (inlineLoggedUser) inlineLoggedUser.textContent = u.username || u.email || "";
    } else {
      inlineLoggedBox.style.display = "none";
      inlineAuthForm.style.display = "block";
    }
  }

  function setInlineMode(isRegister) {
    inlineIsRegister = isRegister;

    if (inlineAuthTitle)
      inlineAuthTitle.textContent = inlineIsRegister ? T("register") : T("inline_auth_title");

    if (inlineAuthSubmit)
      inlineAuthSubmit.textContent = inlineIsRegister ? T("register") : T("login");

    if (inlineSwitchText)
      inlineSwitchText.textContent = inlineIsRegister ? T("already_have_account") : T("dont_have_account");

    if (inlineSwitchMode)
      inlineSwitchMode.textContent = inlineIsRegister ? T("login") : T("register");

    if (inlineAuthMsg) inlineAuthMsg.textContent = "";
  }

  if (inlineSwitchMode) {
    inlineSwitchMode.addEventListener("click", (e) => {
      e.preventDefault();
      setInlineMode(!inlineIsRegister);
    });
  }

  if (inlineAuthForm) {
    inlineAuthForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const identifier = inlineAuthEmail?.value?.trim();
      const password = inlineAuthPassword?.value;

      if (!identifier || !password) {
        if (inlineAuthMsg) inlineAuthMsg.textContent = T("fill_all_fields");
        return;
      }

      try {
        if (inlineAuthMsg) inlineAuthMsg.textContent = inlineIsRegister ? T("registering") : T("logging_in");

        if (inlineIsRegister) {
          await apiRegister(identifier, identifier, password);
          alert(T("register_success_alert"));
          setInlineMode(false);
          return;
        }

        const user = await apiLogin(identifier, password);
        setLoggedInUser(user);

        if (inlineAuthMsg) inlineAuthMsg.textContent = T("login_success");
        renderAuthStatus();
        renderInlineAuthState();
        syncModalAuthState();

        loadHomeNewItems();
        loadLeaderboard();
      } catch (err) {
        console.error(err);
        if (inlineAuthMsg) inlineAuthMsg.textContent = err.message || "Error";
      }
    });
  }

  if (inlineLogoutBtn) {
    inlineLogoutBtn.addEventListener("click", () => {
      clearLoggedInUser();
      renderAuthStatus();
      renderInlineAuthState();
      syncModalAuthState();
      loadHomeNewItems();
      loadLeaderboard();
    });
  }

  // ---------------------------
  // ✅ Wrapper Popup Login/Register
  // ---------------------------
  const wrapper = document.querySelector(".wrapper");
  const loginLink = document.querySelector(".login-link");
  const registerLink = document.querySelector(".register-link");
  const btnPopup = document.querySelector(".btnLogin-popup");
  const iconClose = document.querySelector(".icon-close");

  const modalLoginForm = document.getElementById("modal-login-form");
  const modalLoginEmail = document.getElementById("modal-login-email");
  const modalLoginPassword = document.getElementById("modal-login-password");
  const modalLoginMsg = document.getElementById("modal-login-msg");

  const modalRegisterForm = document.getElementById("modal-register-form");
  const modalRegisterUsername = document.getElementById("modal-register-username");
  const modalRegisterEmail = document.getElementById("modal-register-email");
  const modalRegisterPassword = document.getElementById("modal-register-password");
  const modalRegisterMsg = document.getElementById("modal-register-msg");

  function openAuthPopup(mode /* "login" | "register" */) {
    if (!wrapper) return;
    wrapper.classList.add("active-popup");
    if (mode === "register") wrapper.classList.add("active");
    else wrapper.classList.remove("active");
    wrapper.setAttribute("aria-hidden", "false");
  }

  function closeAuthPopup() {
    if (!wrapper) return;
    wrapper.classList.remove("active-popup");
    wrapper.setAttribute("aria-hidden", "true");
    if (modalLoginMsg) modalLoginMsg.textContent = "";
    if (modalRegisterMsg) modalRegisterMsg.textContent = "";
  }

  function syncModalAuthState() {
    // 保留，不影響現有功能
  }

  if (registerLink) {
    registerLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (!wrapper) return;
      wrapper.classList.add("active");
    });
  }

  if (loginLink) {
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (!wrapper) return;
      wrapper.classList.remove("active");
    });
  }

  if (btnPopup) {
    btnPopup.addEventListener("click", () => openAuthPopup("login"));
  }

  if (iconClose) {
    iconClose.addEventListener("click", closeAuthPopup);
    iconClose.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") closeAuthPopup();
    });
  }

  if (modalLoginForm) {
    modalLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const identifier = modalLoginEmail?.value?.trim();
      const password = modalLoginPassword?.value;

      if (!identifier || !password) {
        if (modalLoginMsg) modalLoginMsg.textContent = T("fill_all_fields");
        return;
      }

      try {
        if (modalLoginMsg) modalLoginMsg.textContent = T("logging_in");
        const user = await apiLogin(identifier, password);
        setLoggedInUser(user);

        if (modalLoginMsg) modalLoginMsg.textContent = T("login_success");
        renderAuthStatus();
        renderInlineAuthState();
        syncModalAuthState();
        loadHomeNewItems();
        loadLeaderboard();

        setTimeout(() => closeAuthPopup(), 350);
      } catch (err) {
        console.error(err);
        if (modalLoginMsg) modalLoginMsg.textContent = err.message || "Login failed";
      }
    });
  }

  if (modalRegisterForm) {
    modalRegisterForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = modalRegisterUsername?.value?.trim();
      const email = modalRegisterEmail?.value?.trim();
      const password = modalRegisterPassword?.value;

      if (!username || !email || !password) {
        if (modalRegisterMsg) modalRegisterMsg.textContent = T("fill_all_fields");
        return;
      }

      try {
        if (modalRegisterMsg) modalRegisterMsg.textContent = T("registering");
        await apiRegister(username, email, password);

        if (modalRegisterMsg) modalRegisterMsg.textContent = T("register_success_login");
        if (wrapper) wrapper.classList.remove("active");
      } catch (err) {
        console.error(err);
        if (modalRegisterMsg) modalRegisterMsg.textContent = err.message || "Register failed";
      }
    });
  }

  // ---------------------------
  // About popup
  // ---------------------------
  const aboutUsLink = document.getElementById("about-btn");
  const aboutPopup = document.querySelector(".about-popup");
  const aboutCloseBtn = document.querySelector(".about-close");

  if (aboutUsLink && aboutPopup) {
    aboutUsLink.addEventListener("click", (e) => {
      e.preventDefault();
      aboutPopup.classList.add("active");
    });
  }
  if (aboutCloseBtn && aboutPopup) {
    aboutCloseBtn.addEventListener("click", () => {
      aboutPopup.classList.remove("active");
    });
  }
  if (aboutPopup) {
    aboutPopup.addEventListener("click", (e) => {
      if (e.target === aboutPopup) aboutPopup.classList.remove("active");
    });
  }

  // ---------------------------
  // Events popup + Leaflet
  // ---------------------------
  const eventsPopup = document.querySelector(".events-popup");
  const eventsClose = document.querySelector(".events-close");
  const eventInfo = document.getElementById("event-info");
  const eventImg = document.getElementById("event-img");
  const eventTitle = document.getElementById("event-title");
  const eventLocation = document.getElementById("event-location");
  const eventTime = document.getElementById("event-time");
  const eventDesc = document.getElementById("event-desc");
  const btnDirections = document.getElementById("btn-directions");

  const eventData = [
    { id: 1, title: "Community Food Sharing", location: "Taoyuan Public Park", time: "Dec 20, 2025, 10:00 AM - 2:00 PM", desc: "Join us to share and enjoy free food with the community.", img: "https://plus.unsplash.com/premium_photo-1754341357839-a11120163778?", lat: 24.993, lng: 121.296 },
    { id: 2, title: "Clothes Exchange Day", location: "Zhongli Cultural Center", time: "Jan 10, 2026, 9:00 AM - 5:00 PM", desc: "Bring your gently used clothes and swap with others.", img: "https://plus.unsplash.com/premium_photo-1676587710768-3c36f6aa9fdd?", lat: 24.995, lng: 121.300 },
    { id: 3, title: "Book Donation Drive", location: "Taoyuan Library", time: "Feb 5, 2026, 8:00 AM - 4:00 PM", desc: "Donate your old books and help build a community library.", img: "https://images.unsplash.com/photo-1591171550305-7faf12e39a27?", lat: 24.996, lng: 121.298 },
    { id: 4, title: "Spring Gardening Workshop", location: "Yangmei Community Garden", time: "Mar 15, 2026, 1:00 PM - 4:00 PM", desc: "Learn how to plant and care for your own garden.", img: "https://plus.unsplash.com/premium_photo-1679504029329-0dfac5d2d0e5?", lat: 24.990, lng: 121.310 },
    { id: 5, title: "Sustainable Living Seminar", location: "Bade Eco Center", time: "Apr 22, 2026, 10:00 AM - 3:00 PM", desc: "Discover tips and tricks to live a greener lifestyle.", img: "https://plus.unsplash.com/premium_vector-1737389670154-190c67b94837?", lat: 24.988, lng: 121.305 },
    { id: 6, title: "Toy Donation Drive", location: "Taoyuan Sports Complex", time: "May 10, 2026, 7:00 AM - 12:00 PM", desc: "Donate your old toys for orphan houses", img: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?", lat: 24.994, lng: 121.299 },
    { id: 7, title: "Art & Culture Fair", location: "Taoyuan Art Center", time: "Jun 5, 2026, 11:00 AM - 6:00 PM", desc: "Celebrate local art and culture with exhibitions and workshops.", img: "https://images.unsplash.com/photo-1740049348201-608314a9f047?", lat: 24.992, lng: 121.302 },
  ];

  let eventsMap = null;
  let currentEvent = null;

  function showEventInfo(ev) {
    currentEvent = ev;
    if (eventImg) { eventImg.src = ev.img; eventImg.alt = ev.title; }
    if (eventTitle) eventTitle.textContent = ev.title;
    if (eventLocation) eventLocation.textContent = ev.location;
    if (eventTime) eventTime.textContent = ev.time;
    if (eventDesc) eventDesc.textContent = ev.desc;
    if (eventInfo) eventInfo.style.display = "block";
  }

  function initEventsMap() {
    if (!window.L) return;
    if (eventsMap) { eventsMap.remove(); eventsMap = null; }
    eventsMap = L.map("events-map").setView([24.99, 121.30], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(eventsMap);

    eventData.forEach((ev) => {
      const marker = L.marker([ev.lat, ev.lng]).addTo(eventsMap);
      marker.on("click", () => {
        showEventInfo(ev);
        eventsMap.setView([ev.lat, ev.lng], 15);
      });
    });
  }

  function closeEvents() {
    if (eventsPopup) eventsPopup.style.display = "none";
    if (eventInfo) eventInfo.style.display = "none";
    currentEvent = null;
    if (eventsMap) { eventsMap.remove(); eventsMap = null; }
  }

  const openEventsBtn = document.getElementById("events-btn");
  if (openEventsBtn && eventsPopup) {
    openEventsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      eventsPopup.style.display = "flex";
      if (eventInfo) eventInfo.style.display = "none";
      initEventsMap();
    });
  }

  if (eventsClose) eventsClose.addEventListener("click", closeEvents);
  if (eventsPopup) {
    eventsPopup.addEventListener("click", (e) => {
      if (e.target === eventsPopup) closeEvents();
    });
  }

  if (btnDirections) {
    btnDirections.addEventListener("click", () => {
      if (!currentEvent) return alert(T("select_event_first"));
      if (!navigator.geolocation) return alert(T("geolocation_not_supported"));

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${currentEvent.lat},${currentEvent.lng}&travelmode=walking`;
          window.open(url, "_blank");
        },
        () => alert(T("location_failed"))
      );
    });
  }

  // ---------------------------
  // Services popup (from MySQL API)
  // ---------------------------
  const servicesPopup = document.querySelector(".services-popup");
  const servicesClose = document.querySelector(".services-close");
  const servicesBtn = document.getElementById("services-btn");
  const catBtns = document.querySelectorAll(".cat-btn");
  const grid = document.getElementById("items-grid");

  const detailBox = document.getElementById("item-detail");
  const dImg = document.getElementById("detail-img");
  const dName = document.getElementById("detail-name");
  const dDesc = document.getElementById("detail-desc");
  const dStatus = document.getElementById("detail-status");
  const dArea = document.getElementById("detail-area");
  const dDonor = document.getElementById("detail-donor");

  let donationsCache = [];
  let currentCat = "food";

  function renderGridByCategory(cat) {
    currentCat = cat;
    if (!grid) return;

    grid.innerHTML = "";
    if (detailBox) detailBox.classList.add("hidden");

    const filtered = donationsCache.filter((d) => donationToCategory(d) === cat);

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="padding:10px;opacity:.7;">${escapeHtml(T("no_items_category"))}</div>`;
      return;
    }

    filtered.forEach((d) => {
      const img = d.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?";
      const div = document.createElement("div");
      div.className = "item-card";
      div.innerHTML = `
        <img src="${escapeHtml(img)}" alt="">
        <h4>${escapeHtml(d.item_name)}</h4>
      `;
      div.addEventListener("click", () => showDonationDetail(d));
      grid.appendChild(div);
    });
  }

  function showDonationDetail(d) {
    if (!detailBox) return;
    detailBox.classList.remove("hidden");

    const img = d.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?";
    if (dImg) dImg.src = img;
    if (dName) dName.textContent = d.item_name || "";
    if (dDesc) dDesc.textContent = d.description || "(No description)";
    if (dStatus) dStatus.textContent = `Available · Qty: ${d.amount ?? "-"}`;
    if (dArea) dArea.textContent = `${d.area || "-"} · ${d.pickup_location || "-"}`;
    if (dDonor) dDonor.textContent = d.username ? d.username : `User #${d.donor_id ?? "-"}`;
  }

  async function loadDonationsToServices() {
    try {
      donationsCache = await fetchDonations();
      renderGridByCategory(currentCat);
    } catch (err) {
      console.error(err);
      if (grid) grid.innerHTML = `<div style="padding:10px;color:#b00020;">${escapeHtml(T("fetch_items_failed"))}</div>`;
    }
  }

  if (servicesBtn && servicesPopup) {
    servicesBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      servicesPopup.style.display = "flex";

      catBtns.forEach((b) => b.classList.remove("active"));
      const first = document.querySelector('.cat-btn[data-cat="food"]');
      if (first) first.classList.add("active");

      currentCat = "food";
      await loadDonationsToServices();
    });
  }

  if (servicesClose && servicesPopup) {
    servicesClose.addEventListener("click", () => {
      servicesPopup.style.display = "none";
    });
  }

  if (servicesPopup) {
    servicesPopup.addEventListener("click", (e) => {
      if (e.target === servicesPopup) servicesPopup.style.display = "none";
    });
  }

  catBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      catBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderGridByCategory(btn.dataset.cat);
    });
  });

  const addDonationBtn = document.getElementById("add-donation-btn");
  if (addDonationBtn) {
    addDonationBtn.addEventListener("click", () => {
      window.location.href = "/add-donation.html";
    });
  }

  // ---------------------------
  // ✅ i18n (EN/中文 toggle)
  // ---------------------------
  const langBtn = document.getElementById("lang-toggle");

  function renderLangBtn() {
    const lang = window.i18n?.getLang?.() || "en";
    if (!langBtn) return;
    langBtn.textContent = lang === "en" ? "中文" : "EN";
  }

  if (window.i18n?.applyLang) {
    window.i18n.applyLang(window.i18n.getLang());
    renderLangBtn();
  }

  if (langBtn) {
    langBtn.addEventListener("click", () => {
      const cur = window.i18n.getLang();
      const next = cur === "en" ? "zh" : "en";
      window.i18n.setLang(next);
      window.i18n.applyLang(next);
      renderLangBtn();
    });
  }

  // ✅ 語言切換後：重畫動態文字（很重要）
  document.addEventListener("languageChange", () => {
    renderAuthStatus();
    setInlineMode(inlineIsRegister);
    loadHomeNewItems();
    loadLeaderboard();
  });

  // ---------------------------
  // ✅ Init
  // ---------------------------
  renderAuthStatus();
  renderInlineAuthState();
  setInlineMode(false);

  loadHomeNewItems();
  loadLeaderboard();
});
