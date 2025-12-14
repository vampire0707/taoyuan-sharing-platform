// ===============================
// add-donation.js (EN FINAL)
// ===============================
const API_BASE = ""; // same domain

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function setMessage(el, text, type = "info") {
  if (!el) return;
  el.textContent = text || "";
  el.style.color =
    type === "success" ? "green" :
    type === "error" ? "#b00020" :
    "#4a2c12";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("donationForm");
  const msg = document.getElementById("msg");
  const btnSubmit = document.getElementById("btn-submit");
  const loginWarning = document.getElementById("login-warning");

  const categoryEl = document.getElementById("category");
  const itemNameEl = document.getElementById("item_name");
  const qtyEl = document.getElementById("quantity");
  const areaEl = document.getElementById("area");
  const pickupEl = document.getElementById("pickup_location");
  const imageEl = document.getElementById("image_url");
  const descEl = document.getElementById("description");

  // ✅ must be logged in
  const user = getLoggedInUser();
  const donorId = user?.user_id;

  if (!donorId) {
    if (loginWarning) loginWarning.style.display = "block";
    if (btnSubmit) btnSubmit.disabled = true;

    if (form) {
      Array.from(form.querySelectorAll("input, select, textarea")).forEach((el) => {
        el.disabled = true;
      });
    }

    setMessage(msg, "Please login first to post a donation.", "error");
    return;
  }

  if (loginWarning) loginWarning.style.display = "none";

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMessage(msg, "", "info");

    const category = categoryEl?.value || "";
    const item_name = (itemNameEl?.value || "").trim();
    const quantity = Number(qtyEl?.value || 0);

    const area = (areaEl?.value || "").trim();
    const pickup_location = (pickupEl?.value || "").trim();
    const image_url = (imageEl?.value || "").trim();
    const descriptionRaw = (descEl?.value || "").trim();

    if (!category) return setMessage(msg, "❌ Please select a category.", "error");
    if (!item_name) return setMessage(msg, "❌ Item name is required.", "error");
    if (!quantity || quantity < 1) return setMessage(msg, "❌ Quantity must be at least 1.", "error");

    // ✅ keep category tag for stable filtering on home page
    const description = `[${category}] ${descriptionRaw}`.trim();

    const payload = {
      donor_id: donorId,
      item_name,
      quantity,
      area: area || null,
      pickup_location: pickup_location || null,
      image_url: image_url || null,
      description: description || null,
    };

    try {
      if (btnSubmit) btnSubmit.disabled = true;
      setMessage(msg, "Submitting...", "info");

      const res = await fetch(`${API_BASE}/api/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to create donation.");

      setMessage(msg, "✅ Posted successfully!", "success");
      form.reset();

      setTimeout(() => {
        window.location.href = "/index.html";
      }, 800);

    } catch (err) {
      console.error(err);
      setMessage(msg, "❌ " + (err?.message || "Operation failed."), "error");
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
    }
  });
});
