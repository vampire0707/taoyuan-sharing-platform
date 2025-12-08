document.addEventListener("DOMContentLoaded", () => {
  // ====== Upcoming Events Slider（多語） ======
  const eventsSlider = document.getElementById("events-slider");
  const upcomingBar = document.getElementById("upcomingBar");

  if (upcomingBar) {
    upcomingBar.addEventListener("click", () => {
      window.location.href = "https://example.com/upcoming-events";
    });
  }

  // 事件資料（圖片 + key，文字從 i18nText 取）
  const eventsData = [
    {
      key: "event1",
      img: "https://plus.unsplash.com/premium_photo-1754341357839-a11120163778?",
    },
    {
      key: "event2",
      img: "https://images.unsplash.com/photo-1591171550305-7faf12e39a27?",
    },
    {
      key: "event3",
      img: "https://plus.unsplash.com/premium_photo-1676587710768-3c36f6aa9fdd?",
    },
    {
      key: "event4",
      img: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?",
    },
  ];

  function buildEvents() {
    if (!eventsSlider) return;
    eventsSlider.innerHTML = "";

    // 重複兩輪，做「看起來無限捲動」
    const repeatData = [...eventsData, ...eventsData];

    repeatData.forEach((e) => {
      const card = document.createElement("div");
      card.className = "item";
      card.dataset.eventKey = e.key;

      card.innerHTML = `
        <img src="${e.img}" alt="" />
        <span class="badge" data-i18n-event-badge></span>
        <div class="text-below">
          <h3 data-i18n-event-title></h3>
          <p data-i18n-event-info></p>
        </div>
      `;

      eventsSlider.appendChild(card);
    });
  }

  function updateEventsLang(lang) {
    if (!eventsSlider || typeof i18nText === "undefined") return;
    const dict = i18nText[lang] || i18nText.en;

    eventsSlider.querySelectorAll(".item").forEach((card) => {
      const key = card.dataset.eventKey; // e.g. event1
      const titleEl = card.querySelector("[data-i18n-event-title]");
      const infoEl = card.querySelector("[data-i18n-event-info]");
      const badgeEl = card.querySelector("[data-i18n-event-badge]");

      if (titleEl && dict[`${key}_title`]) {
        titleEl.textContent = dict[`${key}_title`];
      }
      if (infoEl && dict[`${key}_info`]) {
        infoEl.textContent = dict[`${key}_info`];
      }
      if (badgeEl && dict["event_badge"]) {
        badgeEl.textContent = dict["event_badge"];
      }
    });
  }

  // 自動捲動
  let scrollPos = 0;
  const scrollSpeed = 1;

  function startAutoScroll() {
    if (!eventsSlider) return;

    function scrollEvents() {
      scrollPos += scrollSpeed;
      if (scrollPos >= eventsSlider.scrollWidth / 2) scrollPos = 0;
      eventsSlider.scrollLeft = scrollPos;
      requestAnimationFrame(scrollEvents);
    }
    scrollEvents();
  }

  // 左右按鈕
  function addEventSliderButtons() {
    if (!eventsSlider || !eventsSlider.parentElement) return;

    const wrapper = eventsSlider.parentElement;
    wrapper.style.position = "relative";

    const btnLeft = document.createElement("button");
    btnLeft.innerText = "◀";
    btnLeft.className = "slider-btn left";
    wrapper.appendChild(btnLeft);

    const btnRight = document.createElement("button");
    btnRight.innerText = "▶";
    btnRight.className = "slider-btn right";
    wrapper.appendChild(btnRight);

    btnLeft.addEventListener("click", () => {
      scrollPos -= 150;
    });

    btnRight.addEventListener("click", () => {
      scrollPos += 150;
    });
  }

  // ====== New Items（多語 + Modal） ======
  const hotItemsBar = document.getElementById("hotItemsBar");
  const newList = document.getElementById("new-items-list");
  const modal = document.getElementById("item-modal");
  const modalImg = document.getElementById("modal-img");
  const modalName = document.getElementById("modal-name");
  const modalArea = document.getElementById("modal-area");
  const modalDescription = document.getElementById("modal-description");
  const modalDonor = document.getElementById("modal-donor");
  const modalPickup = document.getElementById("modal-pickup");
  const modalClose = document.getElementById("modal-close");

  if (hotItemsBar) {
    hotItemsBar.addEventListener("click", () => {
      window.location.href = "https://example.com/hot-items-list";
    });
  }

  // 每個 item 一個 key，文字從 i18nText 取
  const itemsData = [
    {
      key: "item1",
      img: "https://images.unsplash.com/photo-1677591276151-e11ed2e307c6?",
    },
    {
      key: "item2",
      img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?",
    },
    {
      key: "item3",
      img: "https://images.unsplash.com/photo-1711527124424-463764d8d8e5?",
    },
    {
      key: "item4",
      img: "https://images.unsplash.com/photo-1719274868535-9f4af7296306?",
    },
  ];

  function buildItems() {
    if (!newList) return;
    newList.innerHTML = "";

    itemsData.forEach((item) => {
      const li = document.createElement("li");
      li.dataset.itemKey = item.key;
      li.innerHTML = `
        <img src="${item.img}" alt="" />
        <strong data-i18n-item-name></strong>
        <span data-i18n-item-area></span>
      `;
      newList.appendChild(li);

      // 點擊開 modal
      li.addEventListener("click", () => {
        if (!modal || !modalImg) return;
        const lang =
          typeof getCurrentLang === "function" ? getCurrentLang() : "en";
        const dict = i18nText[lang] || i18nText.en;
        const key = li.dataset.itemKey;

        modal.style.display = "flex";
        modalImg.src = item.img;

        if (modalName && dict[`${key}_name`]) {
          modalName.textContent = dict[`${key}_name`];
        }
        if (modalArea && dict[`${key}_area`]) {
          modalArea.textContent = dict[`${key}_area`];
        }
        if (modalDescription && dict[`${key}_desc`]) {
          modalDescription.textContent = dict[`${key}_desc`];
        }
        if (modalDonor && dict[`${key}_donor`]) {
          modalDonor.textContent = dict[`${key}_donor`];
        }
        if (modalPickup && dict[`${key}_pickup`]) {
          modalPickup.textContent = dict[`${key}_pickup`];
        }
      });
    });
  }

  function updateItemsLang(lang) {
    if (!newList || typeof i18nText === "undefined") return;
    const dict = i18nText[lang] || i18nText.en;

    newList.querySelectorAll("li").forEach((li) => {
      const key = li.dataset.itemKey;
      const nameEl = li.querySelector("[data-i18n-item-name]");
      const areaEl = li.querySelector("[data-i18n-item-area]");

      if (nameEl && dict[`${key}_name`]) {
        nameEl.textContent = dict[`${key}_name`];
      }
      if (areaEl && dict[`${key}_area`]) {
        areaEl.textContent = dict[`${key}_area`];
      }
    });
  }

  // Modal 關閉
  if (modal && modalClose) {
    modalClose.addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  // ====== 初始建構 + 語言同步 ======
  buildEvents();
  buildItems();
  addEventSliderButtons();
  startAutoScroll();

  const initLang =
    typeof getCurrentLang === "function" ? getCurrentLang() : "en";
  updateEventsLang(initLang);
  updateItemsLang(initLang);

  // 語言改變時，更新 Events + Items
  document.addEventListener("languageChange", (e) => {
    const lang = e.detail.lang || "en";
    updateEventsLang(lang);
    updateItemsLang(lang);
  });
});
