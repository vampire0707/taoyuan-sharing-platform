const API_BASE = "https://taoyuan-donation-web-production.up.railway.app";

const form = document.getElementById("donationForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const category = document.getElementById("category").value;
  const item_name = document.getElementById("item_name").value.trim();
  const quantity = Number(document.getElementById("quantity").value);
  const area = document.getElementById("area").value.trim();
  const pickup_location = document.getElementById("pickup_location").value.trim();
  const image_url = document.getElementById("image_url").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!category) {
    alert("請選擇分類");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        item_name,
        quantity,
        area,
        pickup_location,
        image_url,
        description,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "上架失敗");

    // ⭐ 把分類存到 localStorage
    const categoryMap =
      JSON.parse(localStorage.getItem("donationCategories")) || {};
    categoryMap[data.donationId] = category;
    localStorage.setItem("donationCategories", JSON.stringify(categoryMap));

    msg.textContent = "✅ 上架成功";
    msg.className = "message success";
    form.reset();
  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.className = "message error";
  }
});
