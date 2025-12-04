// app.js – InflowAI E‑Ticaret Platformu

const API_BASE = "https://inflowai-api.onrender.com/api";

const formatPrice = (value) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

// Ürün gridleri
const featuredGrid = document.getElementById("featured-products");
const newGrid = document.getElementById("new-products");
const bestsellerGrid = document.getElementById("bestseller-products");

// Sepet elemanları
let CART = [];
const cartCount = document.getElementById("cart-items-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartShipping = document.getElementById("cart-shipping");
const cartTotal = document.getElementById("cart-total");
const headerTotal = document.getElementById("header-cart-total");
const headerBadge = document.getElementById("header-cart-count");

// ---------- API HELPERS ----------

async function apiGet(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      credentials: "include",
    });
    if (!res.ok) {
      console.error("GET hata:", res.status, res.statusText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("GET exception:", err);
    return null;
  }
}

async function apiPost(endpoint, body = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("POST hata:", res.status, res.statusText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("POST exception:", err);
    return null;
  }
}

// ---------- ÜRÜN YÜKLEME ----------

function normalizeProducts(apiData) {
  if (!apiData) return [];
  if (Array.isArray(apiData)) return apiData;
  if (Array.isArray(apiData.products)) return apiData.products;
  if (Array.isArray(apiData.data)) return apiData.data;
  return [];
}

async function loadProducts() {
  const raw = await apiGet("/products");
  const products = normalizeProducts(raw);

  if (!products.length) {
    renderProducts(featuredGrid, []);
    renderProducts(newGrid, []);
    renderProducts(bestsellerGrid, []);
    return;
  }

  const featured = products.slice(0, 8);
  const newArrivals = products.slice(8, 16);
  const bestsellers = products.slice(16, 24);

  renderProducts(featuredGrid, featured);
  renderProducts(newGrid, newArrivals);
  renderProducts(bestsellerGrid, bestsellers);
}

function renderProducts(targetElement, products) {
  if (!targetElement) return;
  targetElement.innerHTML = "";

  if (!products || !products.length) {
    const empty = document.createElement("div");
    empty.style.fontSize = "13px";
    empty.style.color = "#777";
    empty.textContent = "Şu anda listelenecek ürün bulunamadı.";
    targetElement.appendChild(empty);
    return;
  }

  products.forEach((product) => {
    const {
      _id,
      id,
      name,
      title,
      price,
      oldPrice,
      image,
      imageUrl,
      images,
    } = product;

    const productId = _id || id;
    const productName = name || title || "Ürün Adı";
    const productPrice = Number(price || 0);
    const productOldPrice = oldPrice ? Number(oldPrice) : null;

    let imgSrc = "";
    if (image) imgSrc = image;
    else if (imageUrl) imgSrc = imageUrl;
    else if (Array.isArray(images) && images.length) imgSrc = images[0];

    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.productId = productId || "";

    card.innerHTML = `
      <div class="product-image">
        ${
          imgSrc
            ? `<img src="${imgSrc}" alt="${productName}"/>`
            : "<span>Ürün Görseli</span>"
        }
      </div>
      <div class="product-info">
        <h3 class="product-title">${productName}</h3>
        <div class="product-prices">
          ${
            productOldPrice
              ? `<span class="old-price">${formatPrice(
                  productOldPrice
                )}</span>`
              : ""
          }
          <span class="new-price">${formatPrice(productPrice)}</span>
        </div>
        <div class="product-actions">
          <button
            class="btn small add-to-cart"
            type="button"
            data-id="${productId || ""}"
            data-price="${productPrice}"
          >
            Sepete Ekle
          </button>
          <button class="favorite-btn" type="button" aria-label="Favorilere ekle">
            ❤
          </button>
        </div>
      </div>
    `;
    targetElement.appendChild(card);
  });

  attachCartButtonEvents();
}

// ---------- SEPET ----------

function attachCartButtonEvents() {
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    if (btn.dataset.bound === "true") return;

    btn.addEventListener("click", async (e) => {
      const button = e.currentTarget;
      const productId = button.dataset.id;
      const price = Number(button.dataset.price || "0");

      if (!productId) {
        console.warn("Ürün ID bulunamadı.");
        return;
      }

      const result = await apiPost("/cart/add", { productId });

      if (result && result.success && Array.isArray(result.cart)) {
        CART = result.cart;
      } else {
        const localItem = CART.find((i) => i.productId === productId);
        if (localItem) {
          localItem.quantity += 1;
        } else {
          CART.push({ productId, price, quantity: 1 });
        }
      }

      updateCartUI();
    });

    btn.dataset.bound = "true";
  });
}

function updateCartUI() {
  let totalItems = 0;
  let subtotal = 0;

  CART.forEach((item) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.price || 0);
    totalItems += qty;
    subtotal += qty * price;
  });

  const shipping = subtotal > 0 ? 29.9 : 0;
  const total = subtotal + shipping;

  if (cartCount) cartCount.textContent = String(totalItems);
  if (cartSubtotal) cartSubtotal.textContent = formatPrice(subtotal);
  if (cartShipping) cartShipping.textContent = formatPrice(shipping);
  if (cartTotal) cartTotal.textContent = formatPrice(total);

  if (headerTotal) headerTotal.textContent = formatPrice(total);
  if (headerBadge) headerBadge.textContent = String(totalItems);
}

async function loadCartFromApi() {
  const data = await apiGet("/cart");

  if (data && Array.isArray(data.cart)) {
    CART = data.cart;
  } else if (data && Array.isArray(data)) {
    CART = data;
  }

  updateCartUI();
}

// ---------- ALT NAV / MAĞAZA AÇ LINKLERİ ----------

function setupBottomNav() {
  const bottomItems = document.querySelectorAll(".bottom-nav-item");

  const sectionMap = {
    home: document.querySelector(".main-content"),
    categories: document.querySelector(".side-categories"),
    cart: document.querySelector(".cart-summary"),
    account: document.querySelector(".header-actions"),
  };

  bottomItems.forEach((btn) => {
    const target = btn.dataset.target;
    if (!target) return;

    btn.addEventListener("click", () => {
      bottomItems.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const section = sectionMap[target];
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function setupOpenStoreLinks() {
  const links = [
    document.getElementById("open-store-top"),
    document.getElementById("open-store-hero"),
    document.getElementById("open-store-banner"),
    document.getElementById("open-store-footer"),
  ].filter(Boolean);

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      // İleride gerçek "Mağaza Aç / Tedarikçi Kayıt" sayfasına yönlendireceğiz
      alert("Tedarikçi başvuru sayfası yakında aktif olacak, kurban. 😊");
    });
  });
}

// ---------- INIT ----------

window.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCartFromApi();
  updateCartUI();
  setupBottomNav();
  setupOpenStoreLinks();
});
