// supplier.js – InflowAI tedarikçi paneli
const API_BASE = "https://inflowai-api.onrender.com/api";

function getToken() {
  return localStorage.getItem("accessToken") || "";
}

async function authFetch(path, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(API_BASE + path, {
    ...options,
    headers,
  });
}

function initSupplierPanel() {
  const page = document.body.dataset.page;
  if (page !== "supplier-panel") return;

  const userRaw = localStorage.getItem("supplierUser");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const nameEl = document.getElementById("sup-store-name");
  const emailEl = document.getElementById("sup-user-email");

  if (user) {
    nameEl.textContent = user.storeName || user.name || "InflowAI Mağazası";
    emailEl.textContent = user.email || "";
  } else {
    nameEl.textContent = "Tedarikçi";
    emailEl.textContent = "";
  }

  const logoutBtn = document.getElementById("sup-logout");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("supplierUser");
      alert("Çıkış yapıldı.");
      window.location.href = "supplier_login.html";
    };
  }

  initProductForm();
  loadSupplierProducts();
}

// --------- ÜRÜN FORMU + RESİM YÜKLEME ---------

let uploadedImageUrl = "";

function initProductForm() {
  const form = document.getElementById("sup-product-form");
  const msgEl = document.getElementById("sup-prod-message");
  const fileInput = document.getElementById("sup-prod-image-file");
  const preview = document.getElementById("sup-prod-image-preview");

  if (!form) return;

  if (fileInput) {
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("Lütfen sadece resim dosyası seçin.");
        return;
      }
      msgEl.style.color = "#6b7280";
      msgEl.textContent = "Görsel yükleniyor...";

      try {
        const token = getToken();
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch(API_BASE + "/upload/image", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.success === false || !data.url) {
          msgEl.style.color = "#b91c1c";
          msgEl.textContent = data.message || "Görsel yüklenemedi.";
          return;
        }

        uploadedImageUrl = data.url;
        msgEl.style.color = "#15803d";
        msgEl.textContent = "Görsel başarıyla yüklendi.";

        preview.innerHTML = `<img src="${uploadedImageUrl}" alt="" style="max-width:120px;border-radius:8px;">`;
      } catch (err) {
        console.error(err);
        msgEl.style.color = "#b91c1c";
        msgEl.textContent = "Görsel yüklenirken hata oluştu.";
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.style.color = "#6b7280";
    msgEl.textContent = "Ürün kaydediliyor...";

    const body = {
      name: document.getElementById("sup-prod-name").value,
      slug: document.getElementById("sup-prod-slug").value,
      price: Number(
        document.getElementById("sup-prod-price").value || 0
      ),
      stock: Number(
        document.getElementById("sup-prod-stock").value || 0
      ),
      images: uploadedImageUrl ? [uploadedImageUrl] : [],
      description: document.getElementById("sup-prod-description").value,
      active: document.getElementById("sup-prod-active").checked,
    };

    try {
      const res = await authFetch("/supplier/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        msgEl.style.color = "#b91c1c";
        msgEl.textContent =
          data.message || "Ürün kaydedilemedi. Lütfen bilgileri kontrol edin.";
        return;
      }

      msgEl.style.color = "#15803d";
      msgEl.textContent = "Ürün başarıyla kaydedildi.";
      form.reset();
      uploadedImageUrl = "";
      document.getElementById("sup-prod-image-preview").innerHTML = "";
      loadSupplierProducts();
    } catch (err) {
      console.error(err);
      msgEl.style.color = "#b91c1c";
      msgEl.textContent = "Sunucuya ulaşılamadı.";
    }
  });
}

// --------- ÜRÜN LİSTELEME / SİLME ---------

async function loadSupplierProducts() {
  const listEl = document.getElementById("sup-products-list");
  const emptyEl = document.getElementById("sup-products-empty");
  if (!listEl) return;

  listEl.innerHTML = "";
  if (emptyEl) emptyEl.hidden = true;

  try {
    const res = await authFetch("/supplier/products");
    const data = await res.json().catch(() => ({}));
    const products = data.products || [];

    if (!products.length) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    products.forEach((p) => {
      const item = document.createElement("div");
      item.className = "listing-card";
      const img =
        (p.images && p.images[0]) ||
        "https://via.placeholder.com/120x120?text=InflowAI";

      item.innerHTML = `
        <div style="display:flex;gap:10px;">
          <img src="${img}" alt="" style="width:70px;height:70px;border-radius:8px;object-fit:cover;">
          <div>
            <h3>${p.name}</h3>
            <p>${Number(p.price || 0).toFixed(2)} ₺ · Stok: ${p.stock || 0}</p>
            <p class="info-text small">${p.slug}</p>
          </div>
        </div>
        <div style="margin-top:6px;">
          <button class="btn-sm" data-del="${p._id}">Sil</button>
        </div>
      `;
      listEl.appendChild(item);
    });

    listEl.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-del");
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

        try {
          const res = await authFetch(`/supplier/products/${id}`, {
            method: "DELETE",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || data.success === false) {
            alert(data.message || "Ürün silinemedi.");
            return;
          }
          loadSupplierProducts();
        } catch (err) {
          console.error(err);
          alert("Sunucuya ulaşılamadı.");
        }
      });
    });
  } catch (err) {
    console.error(err);
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = "Ürünler yüklenemedi.";
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  initSupplierPanel();
});
