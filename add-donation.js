// add-donation.js

// ✅ 同網域部署（Railway）就用空字串
// ✅ 本機開發（localhost）就打 localhost:3000
const API_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "http://localhost:3000"
  : "";

// ------- helpers -------
function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function setMessage(el, text, type) {
  el.textContent = text;
  el.className = "message " + (type || "");
}

// ------- main -------
document.addEventListener("DOMContentLoaded", () => {
  const whoami = document.getElementById("whoami");
  const form = document.getElementById("donationForm");
  const msgDiv = document.getElementById("msg");
  const backBtn = document.getElementById("backBtn");
  const submitBtn = document.getElementById("submitBtn");

  const user = getLoggedInUser();

  // ✅ 這裡就是你遇到的「明明登入了但上架說沒登入」的核心：
  // localStorage 只認「同一個網域(origin)」。
  // 只要你登入頁跟上架頁不是同一個網域/子網域，就會讀不到 user。
  if (!user || !user.user_id) {
    alert("請先登入才能上架商品！");
    // 回到首頁（同網域）
    location.href = "/";
    return;
  }

  whoami.textContent = `已登入：${user.username || "User"} (#${user.user_id})`;
  whoami.title = whoami.textContent;

  backBtn.addEventListener("click", () => {
    location.href = "/";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMessage(msgDiv, "", "");

    const item_name = document.getElementById("item_name").value.trim();
    const quantity = Number(document.getElementById("quantity").value);
    const area = document.getElementById("area").value.trim();
    const pickup_location = document.getElementById("pickup_location").value.trim();
    const image_url = document.getElementById("image_url").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!item_name) return setMessage(msgDiv, "❌ 物品名稱必填", "error");
    if (!Number.isFinite(quantity) || quantity <= 0) return setMessage(msgDiv, "❌ 數量必須是大於 0 的數字", "error");

    submitBtn.disabled = true;
    submitBtn.textContent = "上架中...";

    try {
      // ✅ 注意：後端 routes/donations.js 期待的是 donor_id、quantity
      const payload = {
        donor_id: Number(user.user_id),
        item_name,
        quantity,
        area: area || null,
        pickup_location: pickup_location || null,
        image_url: image_url || null,
        description: description || null,
      };

      const res = await fetch(`${API_BASE}/api/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `上架失敗（HTTP ${res.status}）`);
      }

      setMessage(msgDiv, `✅ 上架成功！Donation ID：${data.donationId}`, "success");
      form.reset();
      document.getElementById("quantity").value = 1;
    } catch (err) {
      console.error(err);
      setMessage(msgDiv, `❌ 上架失敗：${err.message}`, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "送出上架";
    }
  });
});
