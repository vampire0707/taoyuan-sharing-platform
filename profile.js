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
// Save profile
// -----------------------
async function saveProfile(e) {
  e.preventDefault();

  const user = getLoggedInUser();
  if (!user?.user_id) {
    setText(msgProfile, "❌ Not logged in.");
    return;
  }

  try {
    const payload = {
      phone: pfPhone.value.trim(),
      address: pfAddress.value.trim(),
      bio: pfBio.value.trim(),
    };

    await safeFetchJson("/api/users/me", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    setText(msgProfile, "✅ Profile saved.", true);
    await loadProfileAndStats();
  } catch (e) {
    console.error(e);
    setText(msgProfile, "❌ Save failed. Check server / API.", false);
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
          <td style="padding:10px;">${escapeHtml(d.amount)}</td>
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
  edQty.value = row.amount || 1;
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
// NEW: Request / Claim features
// (APPENDED - do not remove existing code)
// ===============================

// DOM elements (optional: only render if exists)
const myClaimsList = document.getElementById("my-claims");
const myItemRequestsList = document.getElementById("my-item-requests");

// -------------------------------
// My Claims (Requester)
// -------------------------------
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

// -------------------------------
// My Item Requests (Donor)
// -------------------------------
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
                    <!-- ✅ 重點：type=button，避免觸發 profile-form submit -->
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

// -------------------------------
// Click handler (event delegation)
// -------------------------------
async function onRequestActionClick(e) {
  const btn = e.target.closest("button[data-reqid][data-status]");
  if (!btn) return;

  const requestId = Number(btn.getAttribute("data-reqid"));
  const status = btn.getAttribute("data-status");

  // 防呆
  if (!requestId || !status) return;

  // 先 disable，避免連點
  btn.disabled = true;

  try {
    const user = getLoggedInUser();
    console.log("✅ click update:", { requestId, status, userId: user?.user_id });

    // ✅ 用 safeFetchJson（避免回傳非 JSON 時爆炸）
    await safeFetchJson(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": String(user?.user_id || ""),
      },
      body: JSON.stringify({ status }),
    });

    // ✅ 更新成功後重刷
    await loadMyItemRequests();
    await loadMyClaims();
  } catch (err) {
    console.error("❌ update failed:", err);
    alert("Update failed: " + (err?.message || "unknown"));
    btn.disabled = false;
  }
}

// 綁事件（有區塊才綁）
myItemRequestsList?.addEventListener("click", onRequestActionClick);

// -------------------------------
// Init (append-only)
// -------------------------------
loadMyClaims();
loadMyItemRequests();

