(() => {
  const API_BASE = ""; // 同網域留空 (Railway)

  // ---------------------------
  // Helpers
  // ---------------------------
  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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

  function donationToCategory(d) {
    const text = `${d.item_name || ""} ${d.description || ""}`.toLowerCase();
    const has = (arr) => arr.some((k) => text.includes(k));

    if (has(["bread","lunch","snack","fruit","food","rice","meal","麵包","便當","零食","水果","食物"])) return "food";
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

  // ---------------------------
  // DOM Ready
  // ---------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // ===== Login/Register popup UI =====
    const wrapper = document.querySelector(".wrapper");
    const loginLink = document.querySelector(".login-link");
    const registerLink = document.querySelector(".register-link");
    const btnPopup = document.querySelector(".btnLogin-popup");
    const iconClose = document.querySelector(".icon-close");

    if (registerLink && wrapper) {
      registerLink.addEventListener("click", (e) => {
        e.preventDefault();
        wrapper.classList.add("active");
      });
    }
    if (loginLink && wrapper) {
      loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        wrapper.classList.remove("active");
      });
    }
    if (btnPopup && wrapper) {
      btnPopup.addEventListener("click", (e) => {
        e.preventDefault();
        wrapper.classList.add("active-popup");
      });
    }
    if (iconClose && wrapper) {
      iconClose.addEventListener("click", () => {
        wrapper.classList.remove("active-popup");
      });
    }

    // ===== Auth submit (popup) =====
    const loginForm = document.querySelector(".form-box.login form");
    const regForm = document.querySelector(".form-box.register form");

    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login_email")?.value?.trim();
        const password = document.getElementById("login_password")?.value;

        if (!email || !password) return alert("Please enter email and password.");

        try {
          const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password }),
          });
          const data = await res.json();
          if (!res.ok) return alert(data.message || "Login failed");

          setLoggedInUser(data.user);
          alert("✅ Login success!");
          wrapper?.classList.remove("active-popup");
        } catch (err) {
          console.error(err);
          alert("Login failed. Please try again.");
        }
      });
    }

    if (regForm) {
      regForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("reg_email")?.value?.trim();
        const password = document.getElementById("reg_password")?.value;

        if (!email || !password) return alert("Please enter email and password.");

        try {
          const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password, identity: "external", student_id: null }),
          });
          const data = await res.json();
          if (!res.ok) return alert(data.message || "Register failed");

          alert("✅ Register success! Please login.");
          wrapper?.classList.remove("active");
        } catch (err) {
          console.error(err);
          alert("Register failed. Please try again.");
        }
      });
    }

    // ===== Services popup open/close (bind to navbar) =====
    const navServices = document.getElementById("nav-services");
    const servicesPopup = document.querySelector(".services-popup");
    const servicesClose = document.querySelector(".services-close");

    function openServices() {
      if (!servicesPopup) return;
      servicesPopup.style.display = "flex";
      // 每次打開都重新載入，確保上架後看得到
      loadDonationsToServices();
    }

    if (navServices) {
      navServices.addEventListener("click", (e) => {
        e.preventDefault();
        openServices();
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

    // ===== Items grid + detail =====
    const catBtns = document.querySelectorAll(".cat-btn");
    const grid = document.getElementById("items-grid");

    const detailBox = document.getElementById("item-detail");
    const dImg = document.getElementById("detail-img");
    const dName = document.getElementById("detail-name");
    const dDesc = document.getElementById("detail-desc");
    const dQty = document.getElementById("detail-qty");
    const dArea = document.getElementById("detail-area");
    const dPickup = document.getElementById("detail-pickup");
    const dDonor = document.getElementById("detail-donor");

    let donationsCache = [];
    let currentCat = "food";

    function showDonationDetail(d) {
      if (!detailBox) return;
      detailBox.classList.remove("hidden");

      const img = d.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?";
      if (dImg) dImg.src = img;

      if (dName) dName.textContent = d.item_name || "";
      if (dDesc) dDesc.textContent = d.description || "(No description)";
      if (dQty) dQty.textContent = String(d.amount ?? "-");
      if (dArea) dArea.textContent = d.area || "-";
      if (dPickup) dPickup.textContent = d.pickup_location || "-";
      if (dDonor) dDonor.textContent = d.username || `User #${d.donor_id ?? "-"}`;
    }

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
          <div style="font-size:0.9rem;opacity:.85;line-height:1.4;">
            <div><strong>Location:</strong> ${escapeHtml(d.pickup_location || "-")}</div>
            <div><strong>Pickup Area:</strong> ${escapeHtml(d.area || "-")}</div>
            <div><strong>Donor:</strong> ${escapeHtml(d.username || `User #${d.donor_id ?? "-"}`)}</div>
          </div>
        `;

        div.addEventListener("click", () => showDonationDetail(d));
        grid.appendChild(div);
      });
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

    catBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        catBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderGridByCategory(btn.dataset.cat);
      });
    });

    // ===== Add Donation button =====
    const addDonationBtn = document.getElementById("add-donation-btn");
    if (addDonationBtn) {
      addDonationBtn.addEventListener("click", () => {
        const user = getLoggedInUser();
        if (!user) {
          // ✅ 使用者不需要知道自己的 ID，導去登入頁
          return (window.location.href = "/auth.html");
        }
        window.location.href = "/add-donation.html";
      });
    }

    // ===== Events popup (你原本的 events 按鈕是 nav-events) =====
    const navEvents = document.getElementById("nav-events");
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
      if (!eventsPopup) return;
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

    if (navEvents && eventsPopup) {
      navEvents.addEventListener("click", (e) => {
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
  });
})();
