const API_BASE_URL = ""; // 同網域部署在 Railway -> 留空

const form = document.getElementById("donationForm");
const msgDiv = document.getElementById("msg");

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = getLoggedInUser();
  if (!user?.id) {
    msgDiv.className = "message error";
    msgDiv.textContent = "❌ 請先登入再上架";
    return;
  }

  const payload = {
    donor_id: Number(user.id),
    item_name: document.getElementById("item_name").value.trim(),
    quantity: Number(document.getElementById("quantity").value),
    area: document.getElementById("area").value.trim(),
    pickup_location: document.getElementById("pickup_location").value.trim(),
    image_url: document.getElementById("image_url").value.trim(),
    description: document.getElementById("description").value.trim(),
  };

  msgDiv.className = "message";
  msgDiv.textContent = "";

  try {
    const res = await fetch(`${API_BASE_URL}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status}`);
    }

    msgDiv.className = "message success";
    msgDiv.textContent = `✅ 上架成功！Donation ID: ${data.donationId ?? ""}`;
    form.reset();
  } catch (err) {
    console.error(err);
    msgDiv.className = "message error";
    msgDiv.textContent = `❌ 上架失敗：${err.message}`;
  }
});
