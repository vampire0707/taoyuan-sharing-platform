// i18n.js
const I18N = {
  en: {
    // nav
    nav_home: "🏠 Home",
    nav_about: "About us",
    nav_services: "Services",
    nav_events: "Events",
    nav_members: "Members",
    nav_login: "Login",
    nav_register: "Register",
    nav_profile: "My Profile", // ✅ NEW

    // hero
    main_title: "Welcome to Taoyuan Sharing Community",
    main_mission:
      "Share, Save, Smile — Free Food, Clothes, Books & Useful Items Around You!",

    // feature cards
    feature1_title: "♻ Reduce Waste",
    feature1_desc: "Give items a second life instead of throwing them away.",
    feature1_btn: "Browse Items",
    feature2_title: "🤝 Help Students",
    feature2_desc: "Support local and international students in Taoyuan.",
    feature2_btn: "View Ranking",
    feature3_title: "📍 Easy Pickup",
    feature3_desc: "Clear pickup area and location for everyone.",
    feature3_btn: "How It Works",

    // bars
    howto_bar: "✨ How it works",
    quickaccess_bar: "🔐 Quick Access",
    new_items: "🧡 New Items",
    about_bar: "🌿 About",
    services_bar: "🧰 Services",
    events_bar: "🗺 Events",
    members_bar: "🏆 Member Ranking (XP)",

    // howto
    howto_1_title: "1) Login / Register",
    howto_1_desc: "Create an account to post items.",
    howto_2_title: "2) Add Donation",
    howto_2_desc: "Fill item name, qty, area, pickup, image and description.",
    howto_3_title: "3) Everyone Can Browse",
    howto_3_desc: "All users can view item info and donor.",

    // quick access static
    checking_login: "Checking login...",
    inline_logged_title: "✅ You are logged in",
    label_email: "Email:",
    add_donation: "Add Donation",
    logout: "Logout",
    inline_auth_title: "Online Login",
    login: "Login",
    register: "Register",
    dont_have_account: "Don't have an account?",
    already_have_account: "Already have an account?",
    separate_pages_title: "Or use separate pages",
    go_login_page: "Go to Login Page",
    go_register_page: "Go to Register Page",
    login_tip:
      "Tip: After you log in once, you stay logged in (saved in localStorage).",

    // modal labels
    label_qty: "Qty:",
    label_area: "Area:",
    label_pickup: "Pickup:",
    label_donor: "Donor:",
    label_password: "Password",
    label_username: "Username",
    label_phone: "Phone Number",
    registration: "Registration",
    remember_me: "Remember me",
    forgot_password: "Forgot Password?",
    agree_terms: "I agree to the terms & conditions",
    select_area: "Select Your Area (Taoyuan)",

    // about/services/events text
    about_text:
      "Taoyuan Sharing Platform is a student-friendly community website for exchanging food, clothes, books, and useful items. We aim to reduce waste and help students save money.",
    about_open: "Open About Popup",
    services_text:
      "Browse donated items by category. Click an item to view details such as quantity, area, and pickup location.",
    services_open: "Open Items Board",
    events_text:
      "Check community events and get directions from your current location.",
    events_open: "Open Events Map",

    // leaderboard
    xp_rule: "XP rule: XP = total donated quantity × 10 (based on SUM(amount)).",
    loading_leaderboard: "Loading leaderboard...",
    th_rank: "Rank",
    th_user: "User",
    th_listings: "Listings",
    th_total_qty: "Total Qty",
    th_xp: "XP",
    th_level: "Level",

    // services popup
    available_items: "Available Items",
    cat_food: "🍎 Food",
    cat_clothes: "👕 Clothes",
    cat_books: "📚 Books",
    cat_furniture: "🪑 Furniture",
    cat_household: "🏠 Household",
    cat_others: "✨ Others",
    add_donation_btn: "➕ Add Donation",
    label_status: "Status:",
    label_pickup_area: "Pickup Area:",

    // about popup
    about_popup_title: "🌿 About Taoyuan Sharing",
    about_popup_p1:
      "Welcome to Taoyuan Share! Our platform helps students exchange items, services, and support each other in a friendly, safe community.",
    about_popup_p2:
      "Our mission is to reduce waste, save money, and build strong connections between local and international students.",

    // events popup labels
    label_location: "📍 Location:",
    label_time: "🕒 Time:",
    get_directions: "Get Directions from Your Place",

    // ✅ dynamic (script.js 用)
    you_not_logged_in: "You are not logged in.",
    logged_in_as: "Logged in as",
    loading_items: "Loading items...",
    no_items: "No items yet.",
    fetch_items_failed: "Failed to load items from server.",
    no_data: "No data yet.",
    leaderboard_failed: "Failed to load leaderboard.",
    fill_all_fields: "Please fill in all fields.",
    registering: "Registering...",
    logging_in: "Logging in...",
    register_success_login: "✅ Register success! Please login.",
    login_success: "✅ Login success!",
    register_success_alert: "Register success, please login.",
    select_event_first: "Please select an event first!",
    geolocation_not_supported: "Geolocation is not supported by your browser.",
    location_failed: "Unable to retrieve your location.",
    no_items_category: "No items in this category yet.",

    // ===== pages: common / addDonation / profile (NEW) =====
    common_home: "Home",
    common_back: "Back",

    addDonation_title: "Add Donation Item",
    addDonation_loginWarn: "❌ You are not logged in. You cannot post a donation.",
    addDonation_goLogin: "Go to Login",
    addDonation_backHome: "Back to Home",
    addDonation_category: "Category *",
    addDonation_category_placeholder: "Select a category",
    addDonation_aiBtn: "🤖 AI Auto Classify",
    addDonation_aiLabel: "AI",
    addDonation_confLabel: "conf",
    addDonation_itemName: "Item Name *",
    addDonation_quantity: "Quantity *",
    addDonation_area: "Area",
    addDonation_area_ph: "e.g., Taoyuan / Zhongli",
    addDonation_pickup: "Pickup Location",
    addDonation_pickup_ph: "e.g., Zhongli Station / YZU Main Gate",
    addDonation_image: "Image Upload",
    addDonation_desc: "Description",
    addDonation_desc_ph: "Condition, size, notes...",
    addDonation_submit: "Submit",
    addDonation_back: "⬅ Back to Home",

    profile_title: "My Profile",
    profile_header: "👤 My Profile",
    profile_stats: "📊 My Stats",
    profile_myDonations: "📦 My Donations",
    profile_phone: "Phone",
    profile_phone_ph: "Your phone",
    profile_address: "Address",
    profile_address_ph: "Your address",
    profile_bio: "Bio / Self-intro",
    profile_bio_ph: "Introduce yourself...",
    profile_save: "Save",
    profile_xp: "XP",
    profile_totalListings: "Total Listings",
    profile_totalQty: "Total Qty",
    profile_table_id: "ID",
    profile_table_name: "Name",
    profile_table_qty: "Qty",
    profile_table_area: "Area",
    profile_table_pickup: "Pickup",
    profile_table_actions: "Actions",
    profile_edit: "✏️ Edit Donation",
    profile_close: "Close",
    profile_edit_name: "Item Name",
    profile_edit_qty: "Qty",
    profile_edit_area: "Area",
    profile_edit_pickup: "Pickup Location",
    profile_edit_img: "Image URL",
    profile_edit_desc: "Description",
    profile_edit_save: "Save Changes",
    // ===== auth pages (login/register) =====
    auth_login_title: "Login - Taoyuan Sharing Platform",
    auth_login_h2: "Login",
    auth_login_btn: "Login",
    auth_register_title: "Register - Taoyuan Sharing Platform",
    auth_register_h2: "Register",
    auth_register_btn: "Register",
    auth_email_label: "Email",
    auth_password_label: "Password",
    auth_have_account: "Already have an account?",
    auth_login_link: "Login",
    auth_no_account: "No account?",
    auth_register_link: "Register",
    auth_back_home: "Back to Home",
    request_item: "Request this item",
    requested: "Requested",
    request_login_first: "Please login first",
    request_own_item: "You cannot request your own item",
    request_success: "Request sent!",
    request_failed: "Request failed",
    request_already: "You have already requested this item",
    // Add Donation page
    addDonation_login_first: "Please login first to post a donation.",
    addDonation_ai_need_input: "Please enter item name or description first.",
    addDonation_ai_classifying: "AI classifying...",
    addDonation_ai_failed: "AI classify failed.",
    addDonation_ai_ok: "✅ AI classified",
    addDonation_ai_bad_category: "AI returned a category not in the list:",
    addDonation_image_selected: "Image selected (will upload on submit).",
    addDonation_image_uploading: "Uploading image...",
    addDonation_image_upload_ok: "✅ Image uploaded!",
    addDonation_image_upload_failed: "Image upload failed.",
    addDonation_need_category: "❌ Please select a category (AI failed).",
    addDonation_need_item_name: "❌ Item name is required.",
    addDonation_need_qty: "❌ Quantity must be at least 1.",
    addDonation_submitting: "Submitting...",
    addDonation_create_failed: "Failed to create donation.",
    addDonation_post_ok: "✅ Posted successfully!",
    addDonation_operation_failed: "Operation failed."

    
  },

  zh: {
    // nav
    nav_home: "🏠 首頁",
    nav_about: "關於我們",
    nav_services: "服務",
    nav_events: "活動",
    nav_members: "成員",
    nav_login: "登入",
    nav_register: "註冊",
    nav_profile: "個人頁面", // ✅ NEW

    // hero
    main_title: "歡迎來到桃園共享社區",
    main_mission: "分享、省錢、微笑——你身邊就有免費的食物、衣服、書籍和實用物品！",

    // feature cards
    feature1_title: "♻ 減少浪費",
    feature1_desc: "讓物品延續生命，不再被隨手丟棄。",
    feature1_btn: "瀏覽物資",
    feature2_title: "🤝 幫助學生",
    feature2_desc: "支持桃園在地與國際學生互助共享。",
    feature2_btn: "查看排行",
    feature3_title: "📍 方便取貨",
    feature3_desc: "清楚的取貨地點與區域，大家更安心。",
    feature3_btn: "如何運作",

    // bars
    howto_bar: "✨ 工作原理",
    quickaccess_bar: "🔐 快速登入",
    new_items: "🧡 最新上架",
    about_bar: "🌿 關於我們",
    services_bar: "🧰 服務",
    events_bar: "🗺 活動",
    members_bar: "🏆 成員排行（XP）",

    // howto
    howto_1_title: "1) 登入／註冊",
    howto_1_desc: "建立帳號後即可上架物品。",
    howto_2_title: "2) 新增捐贈",
    howto_2_desc: "填寫品名、數量、區域、取貨地點、圖片與描述。",
    howto_3_title: "3) 大家都能瀏覽",
    howto_3_desc: "所有人都能查看物品資訊與捐贈者。",

    // quick access static
    checking_login: "檢查登入中…",
    inline_logged_title: "✅ 已登入",
    label_email: "電子郵件：",
    add_donation: "新增捐贈",
    logout: "登出",
    inline_auth_title: "線上登入",
    login: "登入",
    register: "註冊",
    dont_have_account: "還沒有帳號？",
    already_have_account: "已經有帳號？",
    separate_pages_title: "或使用獨立頁面",
    go_login_page: "前往登入頁",
    go_register_page: "前往註冊頁",
    login_tip: "提示：登入一次後會保持登入（儲存在 localStorage）。",

    // modal labels
    label_qty: "數量：",
    label_area: "區域：",
    label_pickup: "取貨：",
    label_donor: "捐贈者：",
    label_password: "密碼",
    label_username: "使用者名稱",
    label_phone: "電話",
    registration: "註冊",
    remember_me: "記住我",
    forgot_password: "忘記密碼？",
    agree_terms: "我同意條款與條件",
    select_area: "選擇你的區域（桃園）",

    // about/services/events text
    about_text:
      "桃園共享平台是一個學生友善的社群網站，用來交換食物、衣物、書籍與實用物品。我們希望減少浪費並幫助同學省錢。",
    about_open: "開啟關於視窗",
    services_text:
      "依分類瀏覽捐贈物資。點擊物品可查看數量、區域與取貨地點等資訊。",
    services_open: "開啟物資看板",
    events_text: "查看社群活動，並從你的位置取得路線。",
    events_open: "開啟活動地圖",

    // leaderboard
    xp_rule: "XP 規則：XP = 捐贈總數量 × 10（依 SUM(amount) 計算）。",
    loading_leaderboard: "載入排行中…",
    th_rank: "名次",
    th_user: "使用者",
    th_listings: "上架數",
    th_total_qty: "總數量",
    th_xp: "XP",
    th_level: "等級",

    // services popup
    available_items: "可用物資",
    cat_food: "🍎 食物",
    cat_clothes: "👕 衣物",
    cat_books: "📚 書籍",
    cat_furniture: "🪑 家具",
    cat_household: "🏠 家用品",
    cat_others: "✨ 其他",
    add_donation_btn: "➕ 新增捐贈",
    label_status: "狀態：",
    label_pickup_area: "取貨區域：",

    // about popup
    about_popup_title: "🌿 關於桃園共享",
    about_popup_p1:
      "歡迎來到桃園共享！平台協助同學交換物品與互助服務，打造友善且安全的社群。",
    about_popup_p2:
      "我們的目標是減少浪費、節省開支，並促進在地與國際學生的連結。",

    // events popup labels
    label_location: "📍 地點：",
    label_time: "🕒 時間：",
    get_directions: "從我的位置取得路線",

    // ✅ dynamic (script.js 用)
    you_not_logged_in: "尚未登入。",
    logged_in_as: "登入身分",
    loading_items: "載入物資中…",
    no_items: "目前沒有物資。",
    fetch_items_failed: "從伺服器載入物資失敗。",
    no_data: "目前沒有資料。",
    leaderboard_failed: "載入排行失敗。",
    fill_all_fields: "請填寫所有欄位。",
    registering: "註冊中…",
    logging_in: "登入中…",
    register_success_login: "✅ 註冊成功！請登入。",
    login_success: "✅ 登入成功！",
    register_success_alert: "註冊成功，請登入",
    select_event_first: "請先選擇一個活動！",
    geolocation_not_supported: "你的瀏覽器不支援定位功能。",
    location_failed: "無法取得你的定位。",
    no_items_category: "此分類目前沒有物資。",

    // ===== pages: common / addDonation / profile (NEW) =====
    common_home: "首頁",
    common_back: "返回",

    addDonation_title: "新增捐贈商品",
    addDonation_loginWarn: "❌ 尚未登入，無法發佈捐贈。",
    addDonation_goLogin: "前往登入",
    addDonation_backHome: "回到首頁",
    addDonation_category: "分類 *",
    addDonation_category_placeholder: "請選擇分類",
    addDonation_aiBtn: "🤖 AI 自動分類",
    addDonation_aiLabel: "AI",
    addDonation_confLabel: "信心",
    addDonation_itemName: "品名 *",
    addDonation_quantity: "數量 *",
    addDonation_area: "區域",
    addDonation_area_ph: "例：桃園 / 中壢",
    addDonation_pickup: "取貨地點",
    addDonation_pickup_ph: "例：中壢車站 / 元智大學校門口",
    addDonation_image: "上傳圖片",
    addDonation_desc: "描述",
    addDonation_desc_ph: "狀況、尺寸、備註…",
    addDonation_submit: "送出",
    addDonation_back: "⬅ 返回首頁",

    profile_title: "個人資料",
    profile_header: "👤 我的個人資料",
    profile_stats: "📊 我的統計",
    profile_myDonations: "📦 我的捐贈",
    profile_phone: "電話",
    profile_phone_ph: "請輸入電話",
    profile_address: "地址",
    profile_address_ph: "請輸入地址",
    profile_bio: "自我介紹",
    profile_bio_ph: "簡單介紹一下你自己…",
    profile_save: "儲存",
    profile_xp: "經驗值",
    profile_totalListings: "上架數",
    profile_totalQty: "總數量",
    profile_table_id: "編號",
    profile_table_name: "名稱",
    profile_table_qty: "數量",
    profile_table_area: "區域",
    profile_table_pickup: "取貨",
    profile_table_actions: "操作",
    profile_edit: "✏️ 編輯捐贈",
    profile_close: "關閉",
    profile_edit_name: "品名",
    profile_edit_qty: "數量",
    profile_edit_area: "區域",
    profile_edit_pickup: "取貨地點",
    profile_edit_img: "圖片網址",
    profile_edit_desc: "描述",
    profile_edit_save: "儲存變更",
    // ===== auth pages (login/register) =====
    auth_login_title: "登入 - 桃園共享平台",
    auth_login_h2: "登入",
    auth_login_btn: "登入",
    auth_register_title: "註冊 - 桃園共享平台",
    auth_register_h2: "註冊",
    auth_register_btn: "註冊",
    auth_email_label: "Email（帳號）",
    auth_password_label: "密碼",
    auth_have_account: "已經有帳號？",
    auth_login_link: "登入",
    auth_no_account: "還沒有帳號？",
    auth_register_link: "註冊",
    auth_back_home: "返回首頁",
    request_item: "申請此物品",
    requested: "已申請",
    request_login_first: "請先登入",
    request_own_item: "不能申請自己的物品",
    request_success: "申請已送出",
    request_failed: "申請失敗",
    request_already: "你已經申請過此物品",
    addDonation_login_first: "請先登入後才能新增捐贈。",
    addDonation_ai_need_input: "請先輸入物品名稱或描述。",
    addDonation_ai_classifying: "AI 分類中...",
    addDonation_ai_failed: "AI 分類失敗。",
    addDonation_ai_ok: "✅ AI 已完成分類",
    addDonation_ai_bad_category: "AI 回傳的分類不在選單內：",
    addDonation_image_selected: "已選擇圖片（送出時會自動上傳）。",
    addDonation_image_uploading: "圖片上傳中...",
    addDonation_image_upload_ok: "✅ 圖片上傳成功！",
    addDonation_image_upload_failed: "圖片上傳失敗。",
    addDonation_need_category: "❌ 請選擇分類（AI 失敗）。",
    addDonation_need_item_name: "❌ 請填寫物品名稱。",
    addDonation_need_qty: "❌ 數量至少要 1。",
    addDonation_submitting: "送出中...",
    addDonation_create_failed: "新增捐贈失敗。",
    addDonation_post_ok: "✅ 新增成功！",
    addDonation_operation_failed: "操作失敗。"

    

  },
};

function getLang() {
  return localStorage.getItem("lang") || "en";
}

function setLang(lang) {
  localStorage.setItem("lang", lang);
}

function t(key) {
  const lang = getLang();
  return (
    (I18N[lang] && I18N[lang][key]) ||
    (I18N.en && I18N.en[key]) ||
    key
  );
}

function applyLang(lang) {
  const use = I18N[lang] ? lang : "en";
  const dict = I18N[use];

  // ✅ 1) data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = (dict && dict[key]) ?? (I18N.en && I18N.en[key]);
    if (text != null) el.textContent = text;
  });

  // ✅ 2) 兼容 id = key（舊版仍可用）
  Object.keys(dict).forEach((key) => {
    const el = document.getElementById(key);
    if (el) el.textContent = dict[key];
  });

  // ✅ 3) placeholders（通用：data-i18n-ph）
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    const key = el.getAttribute("data-i18n-ph");
    const text = (dict && dict[key]) ?? (I18N.en && I18N.en[key]);
    if (text != null) el.placeholder = text;
  });

  // ✅ 4) 通知 script.js / 其他頁重畫動態內容
  document.dispatchEvent(new CustomEvent("languageChange", { detail: { lang: use } }));
}

window.i18n = { getLang, setLang, applyLang, t };
