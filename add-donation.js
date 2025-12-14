// add-donation.js

(function () {
  // ✅ 避免重複宣告衝突：用 window 共享
  window.API_BASE = window.API_BASE || ""; // 同網域就留空

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }

  const user = getUser();

  // ✅ 沒登入就擋下（你現在遇到的「明明登入卻說沒登入」多半是 localStorage 沒存到或不同網域）
  if (!user || !user.user_id) {
    alert("請先登入才能上架商品！");
    // 回首頁（你可以改成 /index.html）
    window.location.href = "/";
    return;
  }

  const who = document.getElementById("who");
  if (who) who.textContent = `目前登入：${user.username || "User"}（ID: ${user.user_id}）`;

  const form = document.getElementById("donationForm");
  const msgDiv = document.getElementById("msg");

  function setMsg(text, ok) {
    if (!msgDiv) return;
    msgDiv.textContent = text;
    msgDiv.className = "msg " + (ok ? "ok" : "err");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("", true);

    const item_name = document.getElementById("item_name").value.trim();
    const quantity = Number(document.getElementById("quantity").value);
    const area = document.getElementById("area").value.trim();
    const pickup_location = document.getElementById("pickup_location").value.trim();
    const image_url = document.getElementById("image_url").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!item_name || !quantity) {
      setMsg("請填寫必填欄位（物品名稱、數量）", false);
      return;
    }

    const payload = {
      donor_id: Number(user.user_id),     // ✅ 不讓使用者填
      item_name,
      quantity,
      area: area || null,
      pickup_location: pickup_location || null,
      image_url: image_url || null,
      description: description || null
    };

    try {
      const res = await fetch(`${window.API_BASE}/api/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `上架失敗（HTTP ${res.status}）`);
      }

      setMsg(`✅ 上架成功！Donation ID：${data.donationId}`, true);
      form.reset();
      document.getElementById("quantity").value = 1;
    } catch (err) {
      console.error(err);
      setMsg(`❌ 上架失敗：${err.message}`, false);
    }
  });
})();
