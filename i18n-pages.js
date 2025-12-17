// i18n-pages.js
document.addEventListener("DOMContentLoaded", () => {
  // 初次載入套用
  window.i18n.applyLang(window.i18n.getLang());

  // ✅ 修正 <html lang="...">
  document.documentElement.lang = window.i18n.getLang();

  // ✅ 翻譯 add-donation 的分類下拉（option 不能塞 span，所以用 JS 改文字）
  function translateCategoryOptions() {
    const sel = document.getElementById("category");
    if (!sel) return;

    // placeholder
    if (sel.options?.[0]) {
      sel.options[0].textContent = window.i18n.t("addDonation_category_placeholder");
    }

    const map = {
      food: "cat_food",
      clothes: "cat_clothes",
      books: "cat_books",
      furniture: "cat_furniture",
      household: "cat_household",
      others: "cat_others",
    };

    for (let i = 0; i < sel.options.length; i++) {
      const opt = sel.options[i];
      const key = map[opt.value];
      if (key) opt.textContent = window.i18n.t(key);
    }
  }

  translateCategoryOptions();

  // 監聽語言切換事件（如果首頁也會 dispatch languageChange）
  document.addEventListener("languageChange", () => {
    document.documentElement.lang = window.i18n.getLang();
    translateCategoryOptions();
  });

  // 語言切換按鈕
  const btn = document.getElementById("langToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const next = window.i18n.getLang() === "en" ? "zh" : "en";
      window.i18n.setLang(next);
      window.i18n.applyLang(next);
      document.documentElement.lang = next;
      translateCategoryOptions();
    });
  }
});
