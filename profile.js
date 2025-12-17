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
    // 1) Profile
    const res1 = await fetch("/api/users/me", { headers: authHeaders() });
    const data1 = await res1.json();
    if (!res1.ok) throw new Error(data1?.message || "Load profile failed");

    pfPhone.value = data1.phone || "";
    pfAddress.value = data1.address || "";
    pfBio.value = data1.bio || "";

    // 2) Stats
    const res2 = await fetch("/api/users/me/stats", { headers: authHeaders() });
    const data2 = await res2.json();
    if (!res2.ok) throw new Error(data2?.message || "Load stats failed");

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

    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Save failed");

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
    const res = await fetch("/api/donations/mine", {
      headers: { "x-user-id": String(user.user_id) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Load my items failed");

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
  const res = await fetch("/api/donations/mine", {
    headers: { "x-user-id": String(user?.user_id || "") },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Load mine failed");
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
      const res = await fetch(`/api/donations/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": String(user?.user_id || "") },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Delete failed");

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

    const res = await fetch(`/api/donations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-id": String(user.user_id) },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Update failed");

    setText(editMsg, "✅ Updated.", true);
    closeEditModal();
    await loadMyItems();
  } catch (err) {
    console.error(err);
    setText(editMsg, "❌ Update failed. Check server / API.", false);
  }
}

// -----------------------
// Init
// -----------------------
document.getElementById("profile-form")?.addEventListener("submit", saveProfile);
tbody?.addEventListener("click", handleTableClick);
editClose?.addEventListener("click", closeEditModal);
editModal?.addEventListener("click", (e) => {
  if (e.target === editModal) closeEditModal();
});
editForm?.addEventListener("submit", submitEdit);

loadProfileAndStats();
loadMyItems();
