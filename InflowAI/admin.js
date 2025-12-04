const API_BASE = "https://inflowai-api.onrender.com/api";

// --- NAVIGATION ---
const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".admin-page");

navItems.forEach((btn) => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page;
    navItems.forEach((b) => b.classList.remove("active"));
    pages.forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`page-${page}`).classList.add("active");
  });
});

// --- API HELPERS ---
async function apiGet(url) {
  try {
    const res = await fetch(API_BASE + url);
    return await res.json();
  } catch {
    return null;
  }
}

async function apiSend(url, method = "POST", body = {}) {
  try {
    const res = await fetch(API_BASE + url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch {
    return null;
  }
}

// --- DASHBOARD ---
async function loadStats() {
  const prod = await apiGet("/products");
  const vendors = await apiGet("/vendors");

  const products = prod?.products || prod || [];
  const vendorList = vendors?.vendors || vendors || [];

  document.getElementById("stat-products").textContent = products.length;
  document.getElementById("stat-vendors").textContent = vendorList.length;
  document.getElementById("stat-active-products").textContent = products.filter(
    (p) => p.isActive !== false
  ).length;
}

// --- PRODUCTS ---
const productFormCard = document.getElementById("product-form-card");
const productForm = document.getElementById("product-form");
const productMsg = document.getElementById("product-form-message");

document.getElementById("btn-new-product").addEventListener("click", () => {
  productForm.reset();
  document.getElementById("product-id").value = "";
  productMsg.textContent = "";
  productFormCard.hidden = false;
});

document.getElementById("product-form-cancel").addEventListener("click", () => {
  productFormCard.hidden = true;
});

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  productMsg.textContent = "Kaydediliyor...";

  const id = document.getElementById("product-id").value;

  const body = {
    name: document.getElementById("product-name").value,
    slug: document.getElementById("product-slug").value,
    price: Number(document.getElementById("product-price").value),
    oldPrice: Number(document.getElementById("product-oldPrice").value || 0),
    stock: Number(document.getElementById("product-stock").value || 0),
    images: document.getElementById("product-image").value
      ? [document.getElementById("product-image").value]
      : [],
    description: document.getElementById("product-description").value,
    isActive: document.getElementById("product-active").checked,
  };

  const method = id ? "PUT" : "POST";
  const url = id ? `/products/${id}` : "/products";

  const res = await apiSend(url, method, body);

  if (!res || res.success === false) {
    productMsg.textContent = "Hata: " + (res?.message || "Kaydedilemedi");
    productMsg.style.color = "red";
    return;
  }

  productMsg.textContent = "Başarıyla kaydedildi";
  productMsg.style.color = "green";

  setTimeout(() => {
    productFormCard.hidden = true;
    loadProducts();
    loadStats();
  }, 600);
});

async function loadProducts() {
  const res = await apiGet("/products");
  const products = res?.products || res || [];

  const tbody = document.getElementById("products-table-body");
  tbody.innerHTML = "";

  products.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.price} ₺</td>
      <td>${p.stock}</td>
      <td>${p.isActive !== false ? "Evet" : "Hayır"}</td>
      <td>
        <button class="btn small" data-edit="${p._id}">Düzenle</button>
        <button class="btn small" data-del="${p._id}">Sil</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => editProduct(btn.dataset.edit));
  });

  tbody.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => deleteProduct(btn.dataset.del));
  });
}

async function editProduct(id) {
  const data = await apiGet("/products/" + id);
  const p = data?.product || data;

  document.getElementById("product-id").value = p._id;
  document.getElementById("product-name").value = p.name;
  document.getElementById("product-slug").value = p.slug;
  document.getElementById("product-price").value = p.price;
  document.getElementById("product-oldPrice").value = p.oldPrice || "";
  document.getElementById("product-stock").value = p.stock;
  document.getElementById("product-image").value = p.images?.[0] || "";
  document.getElementById("product-description").value = p.description || "";
  document.getElementById("product-active").checked = p.isActive !== false;

  productFormCard.hidden = false;
}

async function deleteProduct(id) {
  if (!confirm("Bu ürünü silmek istiyor musun?")) return;
  await apiSend(`/products/${id}`, "DELETE");
  loadProducts();
  loadStats();
}

// --- VENDORS ---
async function loadVendors() {
  const res = await apiGet("/vendors");
  const vendors = res?.vendors || res || [];

  const tbody = document.getElementById("vendors-table-body");
  tbody.innerHTML = "";

  vendors.forEach((v) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${v.name || "-"}</td>
      <td>${v.email || "-"}</td>
      <td>${v.phone || "-"}</td>
      <td>${v.status || "Beklemede"}</td>
    `;
    tbody.appendChild(tr);
  });
}

// INIT
window.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadProducts();
  loadVendors();
});
