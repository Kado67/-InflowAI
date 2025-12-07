const API = "https://inflowai-api.onrender.com/api";
const token = localStorage.getItem("adminToken");

if (!token) {
  alert("Admin girişi gerekli.");
  window.location.href = "admin_login.html";
}

function logoutAdmin() {
  localStorage.removeItem("adminToken");
  window.location.href = "admin_login.html";
}

// ---- BEKLEYEN TEDARİKÇİLER ----
async function loadPendingSuppliers() {
  const box = document.getElementById("pendingSuppliers");
  box.innerHTML = "Yükleniyor...";

  const res = await fetch(API + "/admin/suppliers/pending", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  if (!res.ok) {
    box.innerHTML = "Hata oluştu.";
    return;
  }

  if (data.suppliers.length === 0) {
    box.innerHTML = "Bekleyen başvuru yok.";
    return;
  }

  box.innerHTML = "";

  data.suppliers.forEach(s => {
    box.innerHTML += `
      <div class="supplier-row">
        <div><b>${s.storeName}</b> — ${s.email}</div>
        <button onclick="approve('${s._id}')">Onayla</button>
        <button onclick="reject('${s._id}')" class="reject">Reddet</button>
      </div>
    `;
  });
}

async function approve(id) {
  await fetch(API + `/admin/suppliers/${id}/approve`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token }
  });

  alert("Mağaza onaylandı!");
  loadPendingSuppliers();
  loadActiveSuppliers();
}

async function reject(id) {
  await fetch(API + `/admin/suppliers/${id}/reject`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token }
  });

  alert("Başvuru reddedildi.");
  loadPendingSuppliers();
}

// ---- AKTİF TEDARİKÇİLER ----
async function loadActiveSuppliers() {
  const box = document.getElementById("activeSuppliers");

  const res = await fetch(API + "/users?role=supplier", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  if (!res.ok || !data.users) {
    box.innerHTML = "Bir hata oluştu.";
    return;
  }

  box.innerHTML = "";

  data.users.forEach(u => {
    if (u.status === "active") {
      box.innerHTML += `
        <div class="supplier-row">
          <div>${u.storeName} (${u.email})</div>
        </div>
      `;
    }
  });
}

loadPendingSuppliers();
loadActiveSuppliers();
