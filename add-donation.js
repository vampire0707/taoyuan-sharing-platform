// ===============================
// add-donation.js (EN FINAL + Image Upload + AI Auto Classify + i18n)
// ===============================
const API_BASE = ""; // same domain

function T(key) {
  return window.i18n?.t?.(key) || key;
}

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
  // ⭐ 把 add-donation 接回 i18n
  if (window.i18n?.applyLang) {
    window.i18n.applyLang(window.i18n.getLang());
  }

  const form = document.getElementById("donationForm");
  const msg = document.getElementById("msg");
  const btnSubmit = document.getElementById("btn-submit");
  const loginWarning = document.getElementById("login-warning");

  const categoryEl = document.getElementById("category");
  const itemNameEl = document.getElementById("item_name");
  const qtyEl = document.getElementById("quantity");
  const areaEl = document.getElementById("area");
  const pickupEl = document.getElementById("pickup_location");

  // ✅ Image upload elements
  const imageFileEl = document.getElementById("image_file");
  const uploadMsgEl = document.getElementById("upload_msg");
  const previewEl = document.getElementById("img_preview");

  const descEl = document.getElementById("description");

  // ✅ AI elements
  const btnAuto = document.getElementById("btnAutoClassify");
  const aiBadge = document.getElementById("aiBadge");
  const aiCategoryEl = document.getElementById("aiCategory");
  const aiConfidenceEl = document.getElementById("aiConfidence");
  const aiReasonEl = document.getElementById("aiReason");

  // ✅ must be logged in
  const user = getLoggedInUser();
  const donorId = user?.user_id;

  if (!donorId) {
    if (loginWarning) loginWarning.style.display = "block";
    if (btnSubmit) btnSubmit.disabled = true;

    if (form) {
      Array.from(form.querySelectorAll("input, select, textarea, button")).forEach((el) => {
        if (el.id !== "btn-submit") el.disabled = true;
      });
    }

    setMessage(msg, T("addDonation_login_first"), "error");
    return; // ✅ 現在在 function 裡，合法
  }

  if (loginWarning) loginWarning.style.display = "none";

  // ===============================
  // AI classify helpers
  // ===============================
  async function aiClassify() {
    const item_name = (itemNameEl?.value || "").trim();
    const description = (descEl?.value || "").trim();

    if (!item_name && !description) {
      throw new Error(T("addDonation_ai_need_input"));
    }

    if (aiReasonEl) setMessage(aiReasonEl, T("addDonation_ai_classifying"), "info");

    const res = await fetch(`${API_BASE}/api/ai/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_name, description }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || T("addDonation_ai_failed"));

    // ✅ write back to select
    if (categoryEl) {
      const exists = Array.from(categoryEl.options).some((o) => o.value === data.category);
      if (!exists) throw new Error(`${T("addDonation_ai_bad_category")} ${data.category}`);
      categoryEl.value = data.category;
      categoryEl.setCustomValidity("");
    }

    // ✅ badge UI
    if (aiBadge) aiBadge.style.display = "inline-flex";
    if (aiCategoryEl) aiCategoryEl.textContent = data.category;
    if (aiConfidenceEl) aiConfidenceEl.textContent = String(data.confidence ?? "");
    if (aiReasonEl) {
      setMessage(
        aiReasonEl,
        data.scam_risk ? `scam_risk: ${data.scam_risk}` : T("addDonation_ai_ok"),
        "info"
      );
    }

    return data;
  }

  if (btnAuto) {
    btnAuto.addEventListener("click", async () => {
      try {
        btnAuto.disabled = true;
        await aiClassify();
      } catch (err) {
        console.error(err);
        if (aiReasonEl) setMessage(aiReasonEl, "❌ " + (err?.message || T("addDonation_ai_failed")), "error");
      } finally {
        btnAuto.disabled = false;
      }
    });
  }

  // ===============================
  // Image preview
  // ===============================
  if (imageFileEl && previewEl) {
    imageFileEl.addEventListener("change", () => {
      const file = imageFileEl.files?.[0];
      if (!file) {
        previewEl.style.display = "none";
        previewEl.src = "";
        if (uploadMsgEl) setMessage(uploadMsgEl, "", "info");
        return;
      }
      previewEl.src = URL.createObjectURL(file);
      previewEl.style.display = "block";
      if (uploadMsgEl) setMessage(uploadMsgEl, T("addDonation_image_selected"), "info");
    });
  }

  // ===============================
  // Upload image API
  // ===============================
  async function uploadImageIfAny() {
    const file = imageFileEl?.files?.[0];
    if (!file) return null;

    setMessage(uploadMsgEl, T("addDonation_image_uploading"), "info");

    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: fd,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || T("addDonation_image_upload_failed"));

    setMessage(uploadMsgEl, T("addDonation_image_upload_ok"), "success");

    if (previewEl && data.image_url) {
      previewEl.src = data.image_url;
      previewEl.style.display = "block";
    }

    return data.image_url || null;
  }

  // ===============================
  // Submit form
  // ===============================
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMessage(msg, "", "info");

    const item_name = (itemNameEl?.value || "").trim();
    const quantity = Number(qtyEl?.value || 0);
    const area = (areaEl?.value || "").trim();
    const pickup_location = (pickupEl?.value || "").trim();
    const descriptionRaw = (descEl?.value || "").trim();

    // ✅ If category not selected, try AI auto classify first
    let category = categoryEl?.value || "";
    if (!category) {
      try {
        await aiClassify();
        category = categoryEl?.value || "";
      } catch {
        setMessage(msg, T("addDonation_need_category"), "error");
        return;
      }
    }

    if (!item_name) return setMessage(msg, T("addDonation_need_item_name"), "error");
    if (!quantity || quantity < 1) return setMessage(msg, T("addDonation_need_qty"), "error");

    const description = `[${category}] ${descriptionRaw}`.trim();

    try {
      if (btnSubmit) btnSubmit.disabled = true;
      if (btnAuto) btnAuto.disabled = true;
      setMessage(msg, T("addDonation_submitting"), "info");

      // ✅ 1) upload image first (if any)
      const image_url = await uploadImageIfAny();

      // ✅ 2) create donation with image_url
      const payload = {
        donor_id: donorId,
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
      if (!res.ok) throw new Error(data.message || T("addDonation_create_failed"));

      setMessage(msg, T("addDonation_post_ok"), "success");
      form.reset();

      // reset preview & upload message
      if (previewEl) {
        previewEl.style.display = "none";
        previewEl.src = "";
      }
      if (uploadMsgEl) setMessage(uploadMsgEl, "", "info");

      // reset AI badge
      if (aiBadge) aiBadge.style.display = "none";
      if (aiCategoryEl) aiCategoryEl.textContent = "";
      if (aiConfidenceEl) aiConfidenceEl.textContent = "";
      if (aiReasonEl) setMessage(aiReasonEl, "", "info");

      setTimeout(() => {
        window.location.href = "/index.html";
      }, 800);

    } catch (err) {
      console.error(err);
      setMessage(msg, "❌ " + (err?.message || T("addDonation_operation_failed")), "error");
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
      if (btnAuto) btnAuto.disabled = false;
    }
  });

  // 語言切換事件（可留空）
  document.addEventListener("languageChange", () => {});
});
