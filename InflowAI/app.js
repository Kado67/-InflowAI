// app.js – InflowAI E‑Ticaret Platformu
// Ürünleri API'den çeker, karta basar, sepeti yönetir.

// ===============================
// 0) GENEL AYARLAR
// ===============================

// Backend ana adresi
const API_BASE = "https://inflowai-api.onrender.com/api";

// Para formatı (₺)
const formatPrice = (value) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

// HTML elemanları (ürün gridleri)
const featuredGrid = document.getElementById("featured-products");
const newGrid = document.getElementById("new-products");
const bestsellerGrid = document.getElementById("bestseller-products");

// Sepet elemanları
let CART = [];
const cartCount = document.getElementById("cart-items-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartShipping = document.getElementById("cart-shipping");
const cartTotal = document.getElementById("cart-total");

// Header sepet
const headerTotal = document.getElementById("header-cart-total");
const headerBadge = document.getElementById("header-cart-count");

// ===============================
// 1) API YARDIMCI FONKSİYONLARI
// ===============================

async function apiGet(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      credentials: "include",
    });

    if (!res.ok) {
      console.error("GET hata:", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    return data;
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

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("POST exception:", err);
    return null;
  }
}

// ===============================
// 2) ÜRÜN YÜKLEME
// ===============================

function normalizeProducts(apiData) {
  // Backend birkaç formatta dönebilir:
  // 1) [ {...}, {...} ]
  // 2) { success: true, products: [ {...}, {...} ] }
  // 3) { success: true, data: [ {...}, {...} ] }
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
    console.warn("Ürün verisi boş veya hatalı:", raw);
    renderProducts(featuredGrid, []);
    renderProducts(newGrid, []);
    renderProducts(bestsellerGrid, []);
    return;
  }

  // Basit bir bölme mantığı (ileride backend’ten direkt
  // featured/new/bestseller endpointleri de kullanabiliriz)
  const featured = products.slice(0, 8);
  const newArrivals = products.slice(8, 16);
  const bestsellers = products.slice(16, 24);

  renderProducts(featuredGrid, featured);
  renderProducts(newGrid, newArrivals);
  renderProducts(bestsellerGrid, bestsellers);
}

// Ürünleri ekrana bas
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

    // Görsel
    let imgSrc = "";
    if (image) imgSrc = image;
    else if (imageUrl) imgSrc = imageUrl;
    else if (Array.isArray(images) && images.length) imgSrc = images[0];

    const card = document.createElement("article");
    card.className = "product-card";
    card.setAttribute("data-product-id", productId || "");

    card.innerHTML = `
      <div class="product-image">
        ${
          imgSrc
            ? `<img src="${imgSrc}" alt="${productName}" />`
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

  // Yeni render edilen butonlar için event bağla
  attachCartButtonEvents();
}

// ===============================
// 3) SEPET SİSTEMİ
// ===============================

function attachCartButtonEvents() {
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    // Aynı butona iki kere listener eklememek için kontrol
    if (btn.dataset.bound === "true") return;

    btn.addEventListener("click", async (e) => {
      const button = e.currentTarget;
      const productId = button.getAttribute("data-id");
      const price = Number(button.getAttribute("data-price") || "0");

      if (!productId) {
        console.warn("Ürün ID bulunamadı.");
        return;
      }

      // Önce backend sepetine eklemeyi dene
      const result = await apiPost("/cart/add", { productId });

      if (result && result.success && Array.isArray(result.cart)) {
        CART = result.cart;
      } else {
        // Backend tarafı hazır değilse, en azından front-end sepeti çalışsın
        const localItem = CART.find((i) => i.productId === productId);
        if (localItem) {
          localItem.quantity += 1;
        } else {
          CART.push({
            productId,
            price,
            quantity: 1,
          });
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

  // Şimdilik sabit kargo mantığı
  const shipping = subtotal > 0 ? 29.9 : 0;
  const total = subtotal + shipping;

  if (cartCount) cartCount.textContent = String(totalItems);
  if (cartSubtotal) cartSubtotal.textContent = formatPrice(subtotal);
  if (cartShipping) cartShipping.textContent = formatPrice(shipping);
  if (cartTotal) cartTotal.textContent = formatPrice(total);

  if (headerTotal) headerTotal.textContent = formatPrice(total);
  if (headerBadge) headerBadge.textContent = String(totalItems);
}

// Backend sepetini yükle (kullanıcı giriş yaptıysa)
async function loadCartFromApi() {
  const data = await apiGet("/cart");

  if (data && Array.isArray(data.cart)) {
    CART = data.cart;
  } else if (data && Array.isArray(data)) {
    // Backend direkt [] döndürürse
    CART = data;
  }

  updateCartUI();
}

// ===============================
// 4) SAYFA YÜKLENİNCE
// ===============================

window.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCartFromApi();
  updateCartUI(); // Başlangıçta sıfır değerleri göster
});
