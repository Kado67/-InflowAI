// app.js – InflowAI frontend
const API_BASE = "https://inflowai-api.onrender.com/api";

// TOKEN (giriş sistemi hazır olduğunda doldurulacak)
function getAccessToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

// Basit GET / POST helper
async function apiGet(path) {
  try {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error("Status " + res.status);
    return await res.json();
  } catch (e) {
    console.error("GET hata:", e);
    return null;
  }
}

async function apiSend(path, method = "POST", body = {}) {
  try {
    const headers = { "Content-Type": "application/json" };
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(API_BASE + path, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn("API hata:", res.status, data);
      return { success: false, ...data };
    }
    return data;
  } catch (e) {
    console.error("API send hata:", e);
    return { success: false, message: "Sunucuya ulaşılamadı." };
  }
}

/* ---------------- CART / FAVORITES (localStorage) ---------------- */

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCart() {
  return loadFromStorage("cart", []);
}

function setCart(c) {
  saveToStorage("cart", c);
}

function getFavorites() {
  return loadFromStorage("favorites", []);
}

function setFavorites(list) {
  saveToStorage("favorites", list);
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((c) => c.id === product._id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product._id,
      name: product.name,
      price: product.price,
      image:
        (product.images && product.images[0]) ||
        "https://via.placeholder.com/300",
      qty: 1,
    });
  }
  setCart(cart);
  alert("Ürün sepete eklendi.");
}

function toggleFavorite(product) {
  const favs = getFavorites();
  const idx = favs.findIndex((f) => f.id === product._id);
  if (idx >= 0) {
    favs.splice(idx, 1);
    alert("Favorilerden çıkarıldı.");
  } else {
    favs.push({
      id: product._id,
      name: product.name,
      price: product.price,
      image:
        (product.images && product.images[0]) ||
        "https://via.placeholder.com/300",
    });
    alert("Favorilere eklendi.");
  }
  setFavorites(favs);
}

/* ---------------- INDEX: ÜRÜN YÜKLEME ---------------- */

async function loadHomeProducts() {
  const listEl = document.getElementById("product-list");
  const msgEl = document.getElementById("product-list-message");
  if (!listEl) return;

  listEl.innerHTML = "";
  if (msgEl) msgEl.textContent = "Ürünler yükleniyor...";

  const data = await apiGet("/products");
  const products = data?.products || data || [];

  if (!products.length) {
    if (msgEl) msgEl.textContent =
      "Şu anda listelenecek ürün bulunamadı. Admin panelden ürün ekleyebilirsiniz.";
    return;
  }

  if (msgEl) msgEl.textContent = "";

  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";

    const img = document.createElement("img");
    img.className = "product-image";
    img.src =
      (p.images && p.images[0]) ||
      "https://via.placeholder.com/300x300?text=InflowAI";
    img.alt = p.name || "Ürün";

    const title = document.createElement("div");
    title.className = "product-title";
    title.textContent = p.name || "-";

    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = `${Number(p.price || 0).toFixed(2)} ₺`;

    const oldPrice = document.createElement("div");
    oldPrice.className = "product-oldprice";
    if (p.oldPrice) {
      oldPrice.textContent = `${Number(p.oldPrice).toFixed(2)} ₺`;
    } else {
      oldPrice.textContent = "";
    }

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const btnCart = document.createElement("button");
    btnCart.className = "btn-add-cart";
    btnCart.textContent = "Sepete Ekle";
    btnCart.addEventListener("click", () => addToCart(p));

    const btnFav = document.createElement("button");
    btnFav.className = "btn-fav";
    btnFav.textContent = "★";
    btnFav.addEventListener("click", () => toggleFavorite(p));

    actions.appendChild(btnCart);
    actions.appendChild(btnFav);

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(price);
    if (oldPrice.textContent) card.appendChild(oldPrice);
    card.appendChild(actions);
    listEl.appendChild(card);
  });
}

/* ---------------- SEPET SAYFASI ---------------- */

function formatPrice(v) {
  return `₺${Number(v || 0).toFixed(2)}`;
}

function renderCartPage() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const totalItemsEl = document.getElementById("cart-total-items");
  const subtotalEl = document.getElementById("cart-subtotal");
  const shippingEl = document.getElementById("cart-shipping");
  const grandEl = document.getElementById("cart-grandtotal");

  const cart = getCart();
  container.innerHTML = "";

  if (!cart.length) {
    container.innerHTML =
      "<p class='muted-text'>Sepetinizde ürün bulunmuyor.</p>";
    if (totalItemsEl) totalItemsEl.textContent = "0";
    if (subtotalEl) subtotalEl.textContent = formatPrice(0);
    if (shippingEl) shippingEl.textContent = formatPrice(0);
    if (grandEl) grandEl.textContent = formatPrice(0);
    return;
  }

  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.price * item.qty;

    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="cart-row-main">
        <img src="${item.image}" alt="" class="cart-row-img" />
        <div class="cart-row-info">
          <div class="cart-row-title">${item.name}</div>
          <div class="cart-row-price">${formatPrice(item.price)}</div>
          <div class="cart-row-qty">
            Adet:
            <button data-i="${index}" data-delta="-1">-</button>
            <span>${item.qty}</span>
            <button data-i="${index}" data-delta="1">+</button>
          </div>
        </div>
      </div>
      <button class="cart-row-remove" data-remove="${index}">Sil</button>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll("[data-delta]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-i"));
      const delta = Number(btn.getAttribute("data-delta"));
      const cart = getCart();
      if (!cart[i]) return;
      cart[i].qty += delta;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      setCart(cart);
      renderCartPage();
    });
  });

  container.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-remove"));
      const cart = getCart();
      cart.splice(i, 1);
      setCart(cart);
      renderCartPage();
    });
  });

  const shipping = subtotal > 0 ? 0 : 0;
  const grand = subtotal + shipping;

  if (totalItemsEl)
    totalItemsEl.textContent = cart.reduce((a, c) => a + c.qty, 0);
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = formatPrice(shipping);
  if (grandEl) grandEl.textContent = formatPrice(grand);

  const btnCheckout = document.getElementById("btn-checkout");
  if (btnCheckout) {
    btnCheckout.onclick = () => {
      alert(
        "Ödeme entegrasyonu eklendiğinde bu buton ile ödeme adımına geçilecek."
      );
    };
  }
}

/* ---------------- FAVORİLER SAYFASI ---------------- */

function renderFavoritesPage() {
  const listEl = document.getElementById("favorites-list");
  if (!listEl) return;
  const messageEl = document.getElementById("favorites-message");

  const favs = getFavorites();
  listEl.innerHTML = "";

  if (!favs.length) {
    if (messageEl)
      messageEl.textContent =
        "Henüz favorilere eklediğiniz bir ürün yok.";
    return;
  }
  if (messageEl) messageEl.textContent = "";

  favs.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img class="product-image" src="${p.image}" alt="" />
      <div class="product-title">${p.name}</div>
      <div class="product-price">${formatPrice(p.price)}</div>
    `;

    listEl.appendChild(card);
  });
}

/* ---------------- İLANLAR SAYFASI ---------------- */

async function renderListingList() {
  const listEl = document.getElementById("listing-list");
  if (!listEl) return;
  const msgEl = document.getElementById("listing-message");

  listEl.innerHTML = "";
  if (msgEl) msgEl.textContent = "İlanlar yükleniyor...";

  const data = await apiGet("/listings");
  const listings = data?.listings || data?.data || [];

  if (!listings.length) {
    if (msgEl) msgEl.textContent = "Henüz yayınlanmış ilan bulunmuyor.";
    return;
  }
  if (msgEl) msgEl.textContent = "";

  listings.forEach((l) => {
    const card = document.createElement("div");
    card.className = "product-card";
    const imgSrc =
      (l.images && l.images[0]) ||
      "https://via.placeholder.com/300x300?text=InflowAI+İlan";

    card.innerHTML = `
      <img class="product-image" src="${imgSrc}" alt="" />
      <div class="product-title">${l.title || "-"}</div>
      <div class="product-price">${formatPrice(l.price)}</div>
      <div class="muted-text small">${l.city || ""}</div>
      <button class="btn-add-cart" data-id="${l._id}">
        Detayı Gör
      </button>
    `;

    listEl.appendChild(card);
  });

  listEl.querySelectorAll("[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      location.href = `ilan_detay.html?id=${encodeURIComponent(id)}`;
    });
  });
}

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function renderListingDetail() {
  const detailEl = document.getElementById("listing-detail");
  if (!detailEl) return;
  const msgEl = document.getElementById("listing-detail-message");

  const id = getQueryParam("id");
  if (!id) {
    if (msgEl) msgEl.textContent = "Geçersiz ilan bağlantısı.";
    return;
  }

  if (msgEl) msgEl.textContent = "İlan bilgileri yükleniyor...";

  const data = await apiGet(`/listings/${id}`);
  if (!data || !data.listing) {
    if (msgEl) msgEl.textContent = "İlan bulunamadı.";
    return;
  }

  const l = data.listing;
  const imgSrc =
    (l.images && l.images[0]) ||
    "https://via.placeholder.com/600x400?text=InflowAI+İlan";

  detailEl.innerHTML = `
    <img src="${imgSrc}" alt="" class="product-image" />
    <h2>${l.title || "-"}</h2>
    <p class="product-price">${formatPrice(l.price)}</p>
    <p class="muted-text small">${l.city || ""}${
    l.category ? " · " + l.category : ""
  }</p>
    <p>${(l.description || "").replace(/\n/g, "<br>")}</p>
  `;

  if (msgEl) msgEl.textContent = "";
}

/* ---------------- İLAN VER SAYFASI ---------------- */

function initListingForm() {
  const form = document.getElementById("listing-form");
  if (!form) return;
  const msgEl = document.getElementById("listing-form-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) {
      if (msgEl) {
        msgEl.style.color = "#b91c1c";
        msgEl.textContent = "İlan vermek için önce giriş yapmanız gerekir.";
      }
      return;
    }

    const body = {
      title: document.getElementById("listing-title").value,
      description: document.getElementById("listing-description").value,
      price: Number(
        document.getElementById("listing-price").value || 0
      ),
      city: document.getElementById("listing-city").value,
      category: document.getElementById("listing-category").value,
      images: document.getElementById("listing-image").value
        ? [document.getElementById("listing-image").value]
        : [],
    };

    if (msgEl) {
      msgEl.style.color = "#6b7280";
      msgEl.textContent = "İlan kaydediliyor...";
    }

    const res = await apiSend("/listings", "POST", body);
    if (!res || res.success === false) {
      if (msgEl) {
        msgEl.style.color = "#b91c1c";
        msgEl.textContent = res?.message || "İlan kaydedilemedi.";
      }
      return;
    }

    if (msgEl) {
      msgEl.style.color = "#15803d";
      msgEl.textContent = "İlan başarıyla oluşturuldu.";
    }
    setTimeout(() => {
      location.href = "ilanlar.html";
    }, 800);
  });
}

/* ---------------- ACCOUNT BASİT INIT ---------------- */

function initAccountPage() {
  const nameEl = document.getElementById("account-name");
  const emailEl = document.getElementById("account-email");
  const btnLogout = document.getElementById("btn-logout");

  if (!nameEl || !emailEl) return;

  const token = getAccessToken();
  if (!token) {
    nameEl.textContent = "Misafir Kullanıcı";
    emailEl.textContent = "Giriş yaparak siparişlerinizi görüntüleyebilirsiniz.";
  } else {
    // Gerçek /users/me endpoint'i bağlanınca burası güncellenecek
    nameEl.textContent = "InflowAI üyesi";
    emailEl.textContent = "Profil bilgileriniz yakında burada görünecek.";
  }

  if (btnLogout) {
    btnLogout.onclick = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      alert("Çıkış yapıldı.");
      location.reload();
    };
  }
}

/* ---------------- GENEL INIT ---------------- */

window.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname;

  if (path.endsWith("index.html") || path === "/" || path === "") {
    loadHomeProducts();
    const refBtn = document.getElementById("refresh-products");
    if (refBtn) refBtn.addEventListener("click", loadHomeProducts);
  }

  if (path.endsWith("sepet.html")) {
    renderCartPage();
  }

  if (path.endsWith("favoriler.html")) {
    renderFavoritesPage();
  }

  if (path.endsWith("ilanlar.html")) {
    renderListingList();
  }

  if (path.endsWith("ilan_detay.html")) {
    renderListingDetail();
  }

  if (path.endsWith("ilan_ver.html")) {
    initListingForm();
  }

  if (path.endsWith("hesabim.html")) {
    initAccountPage();
  }
});
