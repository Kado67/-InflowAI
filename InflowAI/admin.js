// admin.js – InflowAI Admin Panel
const API_BASE = "https://inflowai-api.onrender.com/api";

// Eğer kullanıcı login olduysa accessToken zaten localStorage'a yazılmıştır.
// İsim farklıysa (örneğin "token") burada değiştirirsin.
const ACCESS_TOKEN =
  localStorage.getItem("accessToken") || localStorage.getItem("token") || "";

// ------------ YARDIMCI FONKSİYONLAR ------------

function getAuthHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };
  if (ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }
  return headers;
}

async function apiGet(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      console.warn("GET hata:", res.status, path);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("GET isteği hata:", err);
    return null;
  }
}

async function apiSend(path, method = "POST", body = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn("API hata:", res.status, data);
      return { success: false, ...data };
    }
    return data;
  } catch (err) {
    console.error("API send hata:", err);
    return { success: false, message: "Sunucuya ulaşılamadı." };
  }
}

// ------------ NAVIGATION ------------

const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".admin-page");

navItems.forEach((btn) => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page;
    navItems.forEach((b) => b.classList.remove("active"));
    pages.forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add("active");
  });
});

// ------------ DASHBOARD ------------

async function loadStats() {
  const [prodRes, supplierRes] = await Promise.all([
    apiGet("/products"),
    apiGet("/suppliers"),
  ]);

  const products = prodRes?.products || prodRes || [];
  const suppliers = supplierRes?.suppliers || supplierRes || [];

  const activeProducts = products.filter((p) => p.isActive !== false);

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText("stat-products", products.length);
  setText("stat-suppliers", suppliers.length);
  setText("stat-active-products", activeProducts.length);
}

// ------------ ÜRÜN YÖNETİMİ ------------

const productFormCard = document.getElementById("product-form-card");
const productForm = document.getElementById("product-form");
const productFormTitle = document.getElementById("product-form-title");
const productFormMessage = document.getElementById("product-form-message");
const productsTableBody = document.getElementById("products-table-body");

const btnNewProduct = document.getElementById("btn-new-product");
const btnProductCancel = document.getElementById("product-form-cancel");

if (btnNewProduct) {
  btnNewProduct.addEventListener("click", () => openProductForm());
}

if (btnProductCancel) {
  btnProductCancel.addEventListener("click", () => {
    productFormCard.hidden = true;
  });
}

function openProductForm(product = null) {
  productForm.reset();
  productFormMessage.textContent = "";
  document.getElementById("product-id").value = product?._id || "";

  if (product) {
    productFormTitle.textContent = "Ürünü Düzenle";
    document.getElementById("product-name").value = product.name || "";
    document.getElementById("product-slug").value = product.slug || "";
    document.getElementById("product-price").value = product.price || "";
    document.getElementById("product-oldPrice").value =
      product.oldPrice ?? "";
    document.getElementById("product-stock").value = product.stock ?? 0;
    document.getElementById("product-image").value =
      (product.images && product.images[0]) || "";
    document.getElementById("product-description").value =
      product.description || "";
    document.getElementById("product-active").checked =
      product.isActive !== false;
  } else {
    productFormTitle.textContent = "Yeni Ürün Ekle";
    document.getElementById("product-active").checked = true;
  }

  productFormCard.hidden = false;
}

if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    productFormMessage.style.color = "#6b7280";
    productFormMessage.textContent = "Kaydediliyor...";

    if (!ACCESS_TOKEN) {
      productFormMessage.style.color = "#b91c1c";
      productFormMessage.textContent =
        "Ürün kaydetmek için önce giriş yapmalısın.";
      return;
    }

    const id = document.getElementById("product-id").value;

    const body = {
      name: document.getElementById("product-name").value,
      slug: document.getElementById("product-slug").value,
      price: Number(document.getElementById("product-price").value || 0),
      oldPrice: document.getElementById("product-oldPrice").value
        ? Number(document.getElementById("product-oldPrice").value)
        : undefined,
      stock: Number(document.getElementById("product-stock").value || 0),
      images: document.getElementById("product-image").value
        ? [document.getElementById("product-image").value]
        : [],
      description: document.getElementById("product-description").value,
      isActive: document.getElementById("product-active").checked,
    };

    const path = id ? `/products/${id}` : "/products";
    const method = id ? "PUT" : "POST";

    const res = await apiSend(path, method, body);

    if (!res || res.success === false) {
      productFormMessage.style.color = "#b91c1c";
      productFormMessage.textContent =
        res?.message || "Ürün kaydedilemedi. (Token / API kontrol et)";
      return;
    }

    productFormMessage.style.color = "#15803d";
    productFormMessage.textContent = "Ürün kaydedildi.";

    setTimeout(() => {
      productFormCard.hidden = true;
      loadProductsAdmin();
      loadStats();
    }, 600);
  });
}

async function loadProductsAdmin() {
  const res = await apiGet("/products");
  const products = res?.products || res || [];

  productsTableBody.innerHTML = "";

  if (!products.length) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td colspan="5">Henüz ürün yok. "Yeni Ürün" ile ekleyebilirsin.</td>';
    productsTableBody.appendChild(tr);
    return;
  }

  products.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name || "-"}</td>
      <td>${Number(p.price || 0).toFixed(2)} ₺</td>
      <td>${p.stock ?? 0}</td>
      <td>${p.isActive === false ? "Hayır" : "Evet"}</td>
      <td>
        <button class="btn small" data-edit="${p._id}">Düzenle</button>
        <button class="btn small" data-del="${p._id}">Sil</button>
      </td>
    `;
    productsTableBody.appendChild(tr);
  });

  productsTableBody.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-edit");
      const product = products.find((x) => x._id === id);
      if (product) openProductForm(product);
    });
  });

  productsTableBody.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-del");
      if (!ACCESS_TOKEN) {
        alert("Ürün silmek için önce giriş yapmalısın.");
        return;
      }
      if (!confirm("Bu ürünü silmek istiyor musun?")) return;
      const res = await apiSend(`/products/${id}`, "DELETE");
      if (res && res.success !== false) {
        loadProductsAdmin();
        loadStats();
      } else {
        alert(res?.message || "Ürün silinemedi.");
      }
    });
  });
}

// ------------ TEDARİKÇİLER ------------

async function loadSuppliersAdmin() {
  const res = await apiGet("/suppliers");
  const suppliers = res?.suppliers || res || [];
  const tbody = document.getElementById("suppliers-table-body");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (!suppliers.length) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td colspan="4">Kayıtlı tedarikçi bulunamadı.</td>';
    tbody.appendChild(tr);
    return;
  }

  suppliers.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.storeName || s.name || "-"}</td>
      <td>${s.email || "-"}</td>
      <td>${s.phone || "-"}</td>
      <td>${s.status || "Aktif"}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ------------ INIT ------------

window.addEventListener("DOMContentLoaded", async () => {
  await loadStats();
  await loadProductsAdmin();
  await loadSuppliersAdmin();
});
