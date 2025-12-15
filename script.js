// ===============================
// Config
// ===============================
const API_BASE = ""; // 同網域就留空

// ===============================
// Helpers
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

// ✅ 共用：登入
async function apiLogin(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data.user;
}

// ✅ 共用：註冊
async function apiRegister(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, identity: "external", student_id: null }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Register failed");
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
  // ✅ Auth status (顯示已登入/登出)
  // ---------------------------
  const authStatus = document.getElementById("auth-status");

  function renderAuthStatus() {
    const u = getLoggedInUser();
    if (!authStatus) return;

    if (!u) {
      authStatus.innerHTML = `You are not logged in.`;
      return;
    }

    authStatus.innerHTML = `
      Logged in as <strong>${escapeHtml(u.username || "")}</strong>
      <button id="btn-logout" class="nav-btn" type="button" style="margin-left:10px;">Logout</button>
    `;

    const btn = document.getElementById("btn-logout");
    if (btn) {
      btn.addEventListener("click", () => {
        clearLoggedInUser();
        renderAuthStatus();
        renderInlineAuthState();
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
      if (homeMsg) homeMsg.textContent = "Loading items...";
      const rows = await fetchDonations();
      const list = rows.slice(0, 8);

      newItemsList.innerHTML = "";
      if (list.length === 0) {
        if (homeMsg) homeMsg.textContent = "No items yet.";
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
      if (homeMsg) homeMsg.textContent = "Failed to load items from server.";
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
      if (lbMsg) lbMsg.textContent = "Loading leaderboard...";
      const rows = await fetchLeaderboard();

      lbBody.innerHTML = "";
      if (!rows || rows.length === 0) {
        if (lbMsg) lbMsg.textContent = "No data yet.";
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
      if (lbMsg) lbMsg.textContent = "Failed to load leaderboard.";
    }
  }

  // ---------------------------
  // ✅ Inline Quick Auth (登入 <-> 註冊切換)
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
      if (inlineLoggedUser) inlineLoggedUser.textContent = u.username || "";
    } else {
      inlineLoggedBox.style.display = "none";
      inlineAuthForm.style.display = "block";
    }
  }

    function setInlineMode(isRegister) {
    inlineIsRegister = isRegister;

    if (inlineAuthTitle)
        inlineAuthTitle.textContent = inlineIsRegister ? "Quick Register" : "Online Login";

    if (inlineAuthSubmit)
        inlineAuthSubmit.textContent = inlineIsRegister ? "Register" : "Login";

    if (inlineSwitchText)
        inlineSwitchText.textContent = inlineIsRegister
        ? "Already have an account?"
        : "Don't have an account?";

    if (inlineSwitchMode)
        inlineSwitchMode.textContent = inlineIsRegister ? "Login" : "Register";

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

      const username = inlineAuthEmail?.value?.trim();
      const password = inlineAuthPassword?.value;

        if (!username || !password) {
        if (inlineAuthMsg) inlineAuthMsg.textContent = "Please fill in all fields.";
        return;
        }

      try {
        if (inlineAuthMsg) inlineAuthMsg.textContent = inlineIsRegister ? "Registering..." : "Logging in...";

        if (inlineIsRegister) {
          await apiRegister(username, password);
          alert("註冊成功，請登入");
          setInlineMode(false);
          return;
        }

        const user = await apiLogin(username, password);
        setLoggedInUser(user);

        if (inlineAuthMsg) inlineAuthMsg.textContent = "✅ Login success!";
        renderAuthStatus();
        renderInlineAuthState();

        loadHomeNewItems();
        loadLeaderboard();
      } catch (err) {
        console.error(err);
        if (inlineAuthMsg) inlineAuthMsg.textContent = err.message || "操作失敗";
      }
    });
  }

  if (inlineLogoutBtn) {
    inlineLogoutBtn.addEventListener("click", () => {
      clearLoggedInUser();
      renderAuthStatus();
      renderInlineAuthState();
      loadHomeNewItems();
      loadLeaderboard();
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
      if (!currentEvent) return alert("Please select an event first!");
      if (!navigator.geolocation) return alert("Geolocation is not supported by your browser.");

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${currentEvent.lat},${currentEvent.lng}&travelmode=walking`;
          window.open(url, "_blank");
        },
        () => alert("Unable to retrieve your location.")
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
      grid.innerHTML = `<div style="padding:10px;opacity:.7;">No items in this category yet.</div>`;
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
      if (grid) grid.innerHTML = `<div style="padding:10px;color:#b00020;">Failed to load items from server.</div>`;
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


  // ---------------------------
  // ✅ Init
  // ---------------------------
  renderAuthStatus();
  renderInlineAuthState();
  setInlineMode(false);

  loadHomeNewItems();
  loadLeaderboard();
});
