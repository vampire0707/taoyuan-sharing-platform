const API_BASE =
  (location.hostname === "127.0.0.1" || location.hostname === "localhost") && location.port === "5500"
    ? "http://localhost:3000"
    : "";

function getUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
}

function authHeaders() {
  const u = getUser();
  return {
    "Content-Type": "application/json",
    "x-user-id": u?.user_id || u?.id || ""   // 依你後端 user 回傳欄位調整
  };
}

async function apiGet(url) {
  const res = await fetch(`${API_BASE}${url}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPut(url, body) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiDelete(url) {
  const res = await fetch(`${API_BASE}${url}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// DOM
const msg = document.getElementById("profile-msg");
const form = document.getElementById("profile-form");
const phoneEl = document.getElementById("pf-phone");
const addrEl = document.getElementById("pf-address");
const bioEl = document.getElementById("pf-bio");

const stXp = document.getElementById("st-xp");
const stListings = document.getElementById("st-listings");
const stQty = document.getElementById("st-qty");

const myMsg = document.getElementById("myitems-msg");
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

function openEdit(row) {
  edId.value = row.donation_id;
  edName.value = row.item_name || "";
  edQty.value = row.amount ?? 1;
  edArea.value = row.area || "";
  edPickup.value = row.pickup_location || "";
  edImg.value = row.image_url || "";
  edDesc.value = row.description || "";
  editMsg.textContent = "";
  editModal.style.display = "flex";
}

function closeEdit() {
  editModal.style.display = "none";
}

editClose?.addEventListener("click", closeEdit);
editModal?.addEventListener("click", (e) => {
  if (e.target === editModal) closeEdit();
});

async function loadProfile() {
  const u = getUser();
  if (!u) {
    msg.textContent = "Not logged in. Please login first.";
    return;
  }
  msg.textContent = "Loading...";
  const profile = await apiGet("/api/users/me");
  phoneEl.value = profile.phone || "";
  addrEl.value = profile.address || "";
  bioEl.value = profile.bio || "";
  msg.textContent = "";
}

async function loadStats() {
  const s = await apiGet("/api/users/me/stats");
  stXp.textContent = s.xp ?? 0;
  stListings.textContent = s.listings ?? 0;
  stQty.textContent = s.total_qty ?? 0;
}

async function loadMyItems() {
  myMsg.textContent = "Loading your donations...";
  const rows = await apiGet("/api/donations/mine");
  tbody.innerHTML = "";

  if (!rows.length) {
    myMsg.textContent = "No donations yet.";
    return;
  }
  myMsg.textContent = "";

  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid rgba(0,0,0,.08)";
    tr.innerHTML = `
      <td style="padding:10px;">${r.donation_id}</td>
      <td style="padding:10px;"><strong>${r.item_name || ""}</strong></td>
      <td style="padding:10px;">${r.amount ?? 0}</td>
      <td style="padding:10px;">${r.area || ""}</td>
      <td style="padding:10px;">${r.pickup_location || ""}</td>
      <td style="padding:10px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="nav-btn" data-act="edit">Edit</button>
        <button class="nav-btn" data-act="del">Delete</button>
      </td>
    `;

    tr.querySelector('[data-act="edit"]').addEventListener("click", () => openEdit(r));
    tr.querySelector('[data-act="del"]').addEventListener("click", async () => {
      if (!confirm("Delete this donation?")) return;
      await apiDelete(`/api/donations/${r.donation_id}`);
      await refreshAll();
    });

    tbody.appendChild(tr);
  });
}

async function refreshAll() {
  await loadProfile();
  await loadStats();
  await loadMyItems();
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Saving...";
  await apiPut("/api/users/me", {
    phone: phoneEl.value.trim(),
    address: addrEl.value.trim(),
    bio: bioEl.value.trim(),
  });
  msg.textContent = "✅ Saved!";
  setTimeout(() => (msg.textContent = ""), 800);
});

editForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  editMsg.textContent = "Saving...";
  await apiPut(`/api/donations/${edId.value}`, {
    item_name: edName.value.trim(),
    amount: Number(edQty.value) || 1,
    area: edArea.value.trim(),
    pickup_location: edPickup.value.trim(),
    image_url: edImg.value.trim() || null,
    description: edDesc.value.trim(),
  });
  editMsg.textContent = "✅ Updated!";
  setTimeout(() => closeEdit(), 400);
  await refreshAll();
});

refreshAll().catch((err) => {
  console.error(err);
  msg.textContent = "Failed to load profile. Check server / API.";
});
