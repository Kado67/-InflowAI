// app.js – Vitrin + Sepet + Alt Menü

const API_BASE = "https://inflowai-api.onrender.com/api";

const formatPrice = (value) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(Number(value || 0));

const featuredGrid = document.getElementById("featured-products");
const newGrid = document.getElementById("new-products");
const bestsellerGrid = document.getElementById("bestseller-products");

let CART = [];
const cartCount = document.getElementById("cart-items-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartShipping = document.getElementById("cart-shipping");
const cartTotal = document.getElementById("cart-total");
const headerTotal = document.getElementById("header-cart-total");
const headerBadge = document.getElementById("header-cart-count");

// API GET
async function apiGet(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Ürünleri Yükle
function normalizeProducts(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.products)) return data.products;
  return [];
}

async function loadProducts() {
  const raw = await apiGet("/products");
  const products = normalizeProducts(raw);

  if (!products.length) {
    renderProducts(featuredGrid, []);
    return;
  }

  renderProducts(featuredGrid, products.slice(0, 8));
  renderProducts(newGrid, products.slice(8, 16));
  renderProducts(bestsellerGrid, products.slice(16, 24));
}

// Ürünleri render et
function renderProducts(target, products) {
  target.innerHTML = "";
  if (!products.length) {
    target.innerHTML = "<p>Ürün yok.</p>";
    return;
  }

  products.forEach((p) => {
    const price = Number(p.price || 0);
    const img =
      p.image ||
      (Array.isArray(p.images) && p.images[0]) ||
      "https://via.placeholder.com/150";

    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image">
        <img src="${img}" alt="${p.name}" />
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="product-prices">
          <span class="new-price">${formatPrice(price)}</span>
        </div>
        <div class="product-actions">
          <button class="btn small add-to-cart" data-id="${p._id}" data-price="${price}">
            Sepete Ekle
          </button>
          <button class="favorite-btn">❤</button>
        </div>
      </div>
    `;

    target.appendChild(card);
  });

  attachCartButtons();
}

// Sepet
function attachCartButtons() {
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    if (btn.dataset.bound) return;

    btn.dataset.bound = "1";

    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const price = Number(btn.dataset.price);

      const item = CART.find((x) => x.productId === id);
      if (item) item.quantity++;
      else CART.push({ productId: id, price, quantity: 1 });

      updateCartUI();
    });
  });
}

function updateCartUI() {
  let items = 0;
  let subtotal = 0;

  CART.forEach((x) => {
    items += x.quantity;
    subtotal += x.price * x.quantity;
  });

  const shipping = items > 0 ? 29.9 : 0;

  cartCount.textContent = items;
  cartSubtotal.textContent = formatPrice(subtotal);
  cartShipping.textContent = formatPrice(shipping);
  cartTotal.textContent = formatPrice(subtotal + shipping);

  headerBadge.textContent = items;
  headerTotal.textContent = formatPrice(subtotal + shipping);
}

// Alt menü
function setupBottomNav() {
  const buttons = document.querySelectorAll(".bottom-nav-item");
  const map = {
    home: document.querySelector(".main-content"),
    categories: document.querySelector(".side-categories"),
    cart: document.querySelector(".cart-summary"),
    account: document.querySelector(".header-actions"),
  };

  buttons.forEach((b) => {
    b.addEventListener("click", () => {
      buttons.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      map[b.dataset.target]?.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// INIT
window.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  updateCartUI();
  setupBottomNav();
});
