// profile.js

// -----------------------
// Helpers
// -----------------------
function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function authHeaders() {
  const user = getLoggedInUser();
  return {
    "Content-Type": "application/json",
    "x-user-id": String(user?.user_id || ""),
  };
}

function setText(el, text, ok = false) {
  if (!el) return;
  el.textContent = text || "";
  el.style.color = ok ? "#7CFCB2" : "#ffb4a2";
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * ✅ Safe fetch JSON helper
 * - 避免 404/500 回 HTML 卻 res.json() 爆炸
 * - 會把錯誤印在 console
 */
async function safeFetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const rawText = await res.text();
  let data = null;

  if (isJson) {
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch (e) {
      console.error("❌ JSON parse failed:", url, rawText);
      throw new Error("Invalid JSON from server");
    }
  } else {
    data = { message: rawText };
  }

  if (!res.ok) {
    console.error("❌ API error:", res.status, url, data);
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
}

// -----------------------
// Elements
// -----------------------
const msgProfile = document.getElementById("profile-msg");
const msgMyItems = document.getElementById("myitems-msg");

const pfPhone = document.getElementById("pf-phone");
const pfAddress = document.getElementById("pf-address");
const pfBio = document.getElementById("pf-bio");

const stXp = document.getElementById("st-xp");
const stListings = document.getElementById("st-listings");
const stQty = document.getElementById("st-qty");

const tbody = document.getElementById("myitems-body");

// edit modal
const editModal = document.getElementById("edit-modal");
const editClose = document.getElementById("edit-close");
const editForm = document.getElementById("edit-form");
const editMsg = document.getElementById("edit-msg");

const edId = document.getElementById("ed-id");
const edName = document.getElementById("ed-name");
const edQty = document.getElementById("ed-qty");
const edArea = document.getElementById("ed-area");
const edPickup = document.getElementById("ed-pickup");
const edImg = document.getElementById("ed-img");
const edDesc = document.getElementById("ed-desc");

// ✅ only keep ONE upload input/button/msg/preview
const edImgFile = document.getElementById("ed-img-file");
const btnReupload = document.getElementById("btn-reupload");
const edUploadMsg = document.getElementById("ed-upload-msg");
const edImgPreview = document.getElementById("ed-img-preview");

// -----------------------
// Load profile + stats
// -----------------------
async function loadProfileAndStats() {
  const user = getLoggedInUser();
  if (!user?.user_id) {
    setText(msgProfile, "❌ Not logged in. Please login first.");
    return;
  }

  try {
    const data1 = await safeFetchJson("/api/users/me", { headers: authHeaders() });
    pfPhone.value = data1.phone || "";
    pfAddress.value = data1.address || "";
    pfBio.value = data1.bio || "";

    const data2 = await safeFetchJson("/api/users/me/stats", { headers: authHeaders() });
    stXp.textContent = data2.xp ?? 0;
    stListings.textContent = data2.listings ?? 0;
    stQty.textContent = data2.total_qty ?? 0;

    setText(msgProfile, "✅ Loaded.", true);
  } catch (e) {
    console.error(e);
    setText(msgProfile, "Failed to load profile. Check server / API.", false);
  }
}

// -----------------------
// My donations list
// -----------------------
function renderMyItems(rows) {
  if (!tbody) return;

  tbody.innerHTML = rows
    .map((d) => {
      return `
        <tr style="border-bottom:1px solid rgba(255,255,255,.08);">
          <td style="padding:10px;">${escapeHtml(d.donation_id)}</td>
          <td style="padding:10px;">${escapeHtml(d.item_name)}</td>
          <td style="padding:10px;">${escapeHtml(d.quantity ?? d.amount ?? "")}</td>
          <td style="padding:10px;">${escapeHtml(d.area || "")}</td>
          <td style="padding:10px;">${escapeHtml(d.pickup_location || "")}</td>
          <td style="padding:10px; display:flex; gap:8px; flex-wrap:wrap;">
            <button class="nav-btn" data-act="edit" data-id="${d.donation_id}">Edit</button>
            <button class="nav-btn" data-act="del" data-id="${d.donation_id}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadMyItems() {
  const user = getLoggedInUser();
  if (!user?.user_id) {
    setText(msgMyItems, "❌ Not logged in.");
    return;
  }

  setText(msgMyItems, "Loading...", true);

  try {
    const data = await safeFetchJson("/api/donations/mine", {
      headers: { "x-user-id": String(user.user_id) },
    });

    if (!Array.isArray(data) || data.length === 0) {
      renderMyItems([]);
      setText(msgMyItems, "No items yet.", true);
      return;
    }

    renderMyItems(data);
    setText(msgMyItems, `✅ Loaded ${data.length} item(s).`, true);
  } catch (e) {
    console.error(e);
    setText(msgMyItems, "Failed to load items. Check server / API.", false);
  }
}

// -----------------------
// Edit / Delete actions
// -----------------------
function openEditModal(row) {
  if (!editModal) return;

  edId.value = row.donation_id;
  edName.value = row.item_name || "";
  edQty.value = row.quantity ?? row.amount ?? 1;
  edArea.value = row.area || "";
  edPickup.value = row.pickup_location || "";
  edImg.value = row.image_url || "";
  edDesc.value = row.description || "";

  setText(editMsg, "");
  editModal.style.display = "flex";
}

function closeEditModal() {
  if (!editModal) return;
  editModal.style.display = "none";
}

async function getMineMapById() {
  const user = getLoggedInUser();
  const data = await safeFetchJson("/api/donations/mine", {
    headers: { "x-user-id": String(user?.user_id || "") },
  });

  const map = new Map();
  data.forEach((x) => map.set(Number(x.donation_id), x));
  return map;
}

async function handleTableClick(e) {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;

  const act = btn.getAttribute("data-act");
  const id = Number(btn.getAttribute("data-id"));

  try {
    if (act === "edit") {
      const map = await getMineMapById();
      const row = map.get(id);
      if (!row) return;

      openEditModal(row);

      // ✅ reset upload ui
      if (edImgFile) edImgFile.value = "";
      if (edUploadMsg) edUploadMsg.textContent = "";

      // ✅ show current preview
      setPreview(row.image_url || "");

      return;
    }

    if (act === "del") {
      if (!confirm("Delete this item?")) return;

      const user = getLoggedInUser();
      await safeFetchJson(`/api/donations/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": String(user?.user_id || "") },
      });

      await loadMyItems();
    }
  } catch (err) {
    console.error(err);
    alert("Action failed: " + (err.message || "unknown error"));
  }
}

async function submitEdit(e) {
  e.preventDefault();

  const id = Number(edId.value);
  const user = getLoggedInUser();
  if (!user?.user_id) {
    setText(editMsg, "❌ Not logged in.");
    return;
  }

  try {
    const payload = {
      item_name: edName.value.trim(),
      amount: Number(edQty.value || 1),
      area: edArea.value.trim(),
      pickup_location: edPickup.value.trim(),
      image_url: edImg.value.trim() || null,
      description: edDesc.value.trim() || null,
    };

    await safeFetchJson(`/api/donations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-id": String(user.user_id) },
      body: JSON.stringify(payload),
    });

    setText(editMsg, "✅ Updated.", true);
    closeEditModal();
    await loadMyItems();
  } catch (err) {
    console.error(err);
    setText(editMsg, "❌ Update failed. Check server / API.", false);
  }
}

// ===============================
// Request / Claim features (keep)
// ===============================
const myClaimsList = document.getElementById("my-claims");
const myItemRequestsList = document.getElementById("my-item-requests");

async function loadMyClaims() {
  if (!myClaimsList) return;
  const user = getLoggedInUser();
  if (!user?.user_id) return;

  try {
    const data = await safeFetchJson(`/api/requests/me/claims?user_id=${user.user_id}`, {
      headers: authHeaders(),
    });

    myClaimsList.innerHTML =
      Array.isArray(data) && data.length
        ? data
            .map(
              (r) => `
              <li style="margin:6px 0;">
                ${escapeHtml(r.item_name)} —
                <b>${escapeHtml(r.status)}</b>
              </li>
            `
            )
            .join("")
        : "<li>No claims yet.</li>";
  } catch (e) {
    console.error(e);
    myClaimsList.innerHTML = "<li>Failed to load claims.</li>";
  }
}

async function loadMyItemRequests() {
  if (!myItemRequestsList) return;
  const user = getLoggedInUser();
  if (!user?.user_id) return;

  try {
    const data = await safeFetchJson(`/api/requests/me/item-requests?user_id=${user.user_id}`, {
      headers: authHeaders(),
    });

    myItemRequestsList.innerHTML =
      Array.isArray(data) && data.length
        ? data
            .map((r) => {
              const disabled = r.status !== "pending" ? "disabled" : "";
              const note =
                r.status === "approved"
                  ? "✅ approved"
                  : r.status === "rejected"
                  ? "❌ rejected"
                  : "⏳ pending";

              return `
                <li style="margin:10px 0; line-height:1.5;">
                  <div>
                    ${escapeHtml(r.item_name)} — requested by <b>${escapeHtml(r.requester_name || "")}</b>
                    <span style="margin-left:8px; opacity:.85;">(${escapeHtml(note)})</span>
                  </div>

                  <div style="margin-top:6px; display:flex; gap:8px;">
                    <button type="button"
                      data-reqid="${r.request_id}"
                      data-status="approved"
                      ${disabled}
                    >Approve</button>

                    <button type="button"
                      data-reqid="${r.request_id}"
                      data-status="rejected"
                      ${disabled}
                    >Reject</button>
                  </div>
                </li>
              `;
            })
            .join("")
        : "<li>No requests yet.</li>";
  } catch (e) {
    console.error(e);
    myItemRequestsList.innerHTML = "<li>Failed to load item requests.</li>";
  }
}

async function onRequestActionClick(e) {
  const btn = e.target.closest("button[data-reqid][data-status]");
  if (!btn) return;

  const requestId = Number(btn.getAttribute("data-reqid"));
  const status = btn.getAttribute("data-status");
  if (!requestId || !status) return;

  btn.disabled = true;

  try {
    const user = getLoggedInUser();
    await safeFetchJson(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": String(user?.user_id || ""),
      },
      body: JSON.stringify({ status }),
    });

    await loadMyItemRequests();
    await loadMyClaims();
  } catch (err) {
    console.error("❌ update failed:", err);
    alert("Update failed: " + (err?.message || "unknown"));
    btn.disabled = false;
  }
}

myItemRequestsList?.addEventListener("click", onRequestActionClick);

// ===============================
// ✅ FIX: Image preview + upload + save to DB (ONLY ONE SET)
// ===============================
function setPreview(url) {
  if (!edImgPreview) return;

  if (!url) {
    edImgPreview.src = "";
    edImgPreview.style.display = "none";
    return;
  }

  // ✅ blob: 不能加 ?t=
  if (url.startsWith("blob:")) {
    edImgPreview.src = url;
    edImgPreview.style.display = "block";
    return;
  }

  // ✅ non-blob: cache busting
  const bust = url.includes("?") ? "&" : "?";
  edImgPreview.src = url + bust + "t=" + Date.now();
  edImgPreview.style.display = "block";
}

async function uploadToServer(file) {
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.message || "Upload failed");
  if (!data.image_url) throw new Error("No image_url returned");
  return data.image_url; // Cloudinary URL
}

// -------------------------------
// Init
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadProfileAndStats();
  loadMyItems();
  loadMyClaims();
  loadMyItemRequests();

  tbody?.addEventListener("click", handleTableClick);

  editClose?.addEventListener("click", closeEditModal);
  editModal?.addEventListener("click", (e) => {
    if (e.target === editModal) closeEditModal();
  });
  editForm?.addEventListener("submit", submitEdit);

  // ✅ file change -> local preview
  edImgFile?.addEventListener("change", () => {
    const f = edImgFile.files?.[0];
    if (!f) {
      setPreview(edImg.value.trim());
      if (edUploadMsg) edUploadMsg.textContent = "";
      return;
    }
    setPreview(URL.createObjectURL(f));
    if (edUploadMsg) edUploadMsg.textContent = "Image selected.";
  });

  // ✅ button click -> upload -> PUT -> refresh
  btnReupload?.addEventListener("click", async () => {
    const file = edImgFile?.files?.[0];
    const id = Number(edId?.value);
    const user = getLoggedInUser();

    if (!file) return alert("Please choose an image first.");
    if (!id) return alert("Missing donation id.");
    if (!user?.user_id) return alert("Not logged in.");

    try {
      btnReupload.disabled = true;
      if (edUploadMsg) edUploadMsg.textContent = "Uploading...";

      const newUrl = await uploadToServer(file);

      // update input + preview
      edImg.value = newUrl;
      setPreview(newUrl);

      // immediately update DB
      const payload = {
        item_name: edName.value.trim(),
        amount: Number(edQty.value || 1),
        area: edArea.value.trim(),
        pickup_location: edPickup.value.trim(),
        image_url: newUrl,
        description: edDesc.value.trim() || null,
      };

      await safeFetchJson(`/api/donations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-id": String(user.user_id) },
        body: JSON.stringify(payload),
      });

      if (edUploadMsg) edUploadMsg.textContent = "✅ Image uploaded & saved.";
      await loadMyItems();
    } catch (e) {
      console.error(e);
      if (edUploadMsg) edUploadMsg.textContent = "❌ " + (e?.message || "Upload failed");
    } finally {
      btnReupload.disabled = false;
    }
  });
});
