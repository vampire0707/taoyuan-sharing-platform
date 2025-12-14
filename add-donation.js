const API_BASE_URL = ""; // 同網域 => 留空

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("donationForm");
  const msgDiv = document.getElementById("msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msgDiv.textContent = "";
    msgDiv.className = "message";

    const user = getLoggedInUser();
    if (!user?.user_id) {
      msgDiv.textContent = "❌ 請先登入後再上架";
      msgDiv.classList.add("error");
      return;
    }

    const payload = {
      donor_id: Number(user.user_id),               // ✅ 用登入者 id
      item_name: document.getElementById("item_name").value.trim(),
      quantity: Number(document.getElementById("quantity").value),
      area: document.getElementById("area").value.trim(),
      pickup_location: document.getElementById("pickup_location").value.trim(),
      image_url: document.getElementById("image_url").value.trim(),
      description: document.getElementById("description").value.trim(),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `上架失敗（${res.status}）`);
      }

      msgDiv.textContent = `✅ 上架成功！捐贈 ID：${data.donationId ?? ""}`;
      msgDiv.classList.add("success");
      form.reset();
    } catch (err) {
      console.error(err);
      msgDiv.textContent = "❌ 上架失敗：" + err.message;
      msgDiv.classList.add("error");
    }
  });
});
