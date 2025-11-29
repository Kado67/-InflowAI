/* ============================================
   InflowAI E-Ticaret Platformu
   app.js – API bağlantısı, ürün yükleme, sepet sistemi
============================================ */

// API ana adresi
const API = "https://inflowai-api.onrender.com";

// HTML elemanları
const featuredGrid = document.getElementById("featured-products");
const newGrid = document.getElementById("new-products");
const bestsellerGrid = document.getElementById("bestseller-products");

// Sepet elemanları
let CART = [];
const cartCount = document.getElementById("cart-items-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartShipping = document.getElementById("cart-shipping");
const cartTotal = document.getElementById("cart-total");

// ===============================
// 1) API'DEN VERİ ÇEKME
// ===============================

// GET request
async function apiGet(endpoint) {
  const res = await fetch(`${API}${endpoint}`);
  return await res.json();
}

// POST request
async function apiPost(endpoint, data = {}) {
  const res = await fetch(`${API}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// ===============================
// 2) ÜRÜNLERİ YÜKLE
// ===============================

async function loadProducts() {
  try {
    const data = await apiGet("/products");

    if (!data || !Array.isArray(data)) {
      console.warn("API ürün verisi geçersiz:", data);
      return;
    }

    // Ürünleri kategorilere göre ayır
    const featured = data.slice(0, 8);
    const newArrivals = data.slice(8, 16);
    const bestseller = data.slice(16, 24);

    renderProducts(featuredGrid, featured);
    renderProducts(newGrid, newArrivals);
    renderProducts(bestsellerGrid, bestseller);

  } catch (err) {
    console.error("Ürünler yüklenirken hata:", err);
  }
}

// Ürünleri ekrana bas
function renderProducts(target, products) {
  target.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image || ""}" alt="${product.name}">
      </div>

      <div class="product-info">
        <h3>${product.name}</h3>

        <div class="product-prices">
          ${product.oldPrice ? `<span class="old-price">₺${product.oldPrice}</span>` : ""}
          <span class="new-price">₺${product.price}</span>
        </div>

        <div class="product-actions">
          <button class="btn small add-to-cart" data-id="${product.id}">
            Sepete Ekle
          </button>
          <button class="favorite-btn">❤</button>
        </div>
      </div>
    `;

    target.appendChild(card);
  });

  // Sepete ekleme butonlarını aktif et
  activateCartButtons();
}

// ===============================
// 3) SEPET SİSTEMİ
// ===============================

function activateCartButtons() {
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      addToCart(id);
    });
  });
}

// Sepete ekle
async function addToCart(productId) {
  try {
    const result = await apiPost("/cart/add", { id: productId });

    if (result.success) {
      CART = result.cart;
      updateCartUI();
    }
  } catch (err) {
    console.error("Sepete ekleme hatası:", err);
  }
}

// Sepeti güncelle UI
function updateCartUI() {
  let totalItems = 0;
  let subtotal = 0;

  CART.forEach((item) => {
    totalItems += item.quantity;
    subtotal += item.quantity * item.price;
  });

  const shipping = subtotal > 0 ? 29.9 : 0;
  const total = subtotal + shipping;

  cartCount.innerText = totalItems;
  cartSubtotal.innerText = `₺${subtotal.toFixed(2)}`;
  cartShipping.innerText = `₺${shipping.toFixed(2)}`;
  cartTotal.innerText = `₺${total.toFixed(2)}`;

  // Header’daki sepet toplamı da güncellenebilir
  const headerTotal = document.querySelector(".cart-total");
  const headerBadge = document.querySelector(".cart-count-badge");

  if (headerTotal) headerTotal.innerText = `₺${subtotal.toFixed(2)}`;
  if (headerBadge) headerBadge.innerText = totalItems;
}

// ===============================
// 4) SAYFA YÜKLENİNCE BAŞLAT
// ===============================

window.addEventListener("DOMContentLoaded", () => {
  loadProducts();

  // Başlangıç sepetini API’den çek
  apiGet("/cart").then((res) => {
    if (res && res.cart) {
      CART = res.cart;
      updateCartUI();
    }
  });
});
