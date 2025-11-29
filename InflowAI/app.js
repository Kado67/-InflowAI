// =======================================
// InflowAI E-Ticaret - app.js
// Ön yüz ile API arasındaki köprü
// =======================================

// API ana adresin (Render)
const API_BASE_URL = "https://inflowai-api.onrender.com";

// Sayfadaki ana elemanlar
const productListEl = document.getElementById("productList");
const bannerStatusEl = document.getElementById("bannerStatus");

// -----------------------------
// 1) API SAĞLIK / ÖZET KONTROLÜ
// -----------------------------
async function checkApiStatus() {
  try {
    const res = await fetch(API_BASE_URL + "/");
    if (!res.ok) throw new Error("API cevabı başarısız");

    const data = await res.json();
    console.log("API Sağlık:", data);

    if (bannerStatusEl) {
      bannerStatusEl.innerText = "Bağlı • " + (data.service || "InflowAI API");
    }
  } catch (err) {
    console.error("API bağlantı hatası:", err);
    if (bannerStatusEl) {
      bannerStatusEl.innerText = "Bağlantı yok • API kontrol et";
    }
  }
}

// -----------------------------
// 2) ÜRÜN LİSTESİ ÇEKME
//    (Gerçek ürün bekler, demo yok)
// -----------------------------
async function loadProducts() {
  if (!productListEl) return;

  productListEl.innerHTML = "<p>Ürünler yükleniyor...</p>";

  try {
    const res = await fetch(API_BASE_URL + "/products"); // <-- backend’de gerçek endpoint
    if (!res.ok) {
      // Endpoint hazır değilse bile kullanıcıya net mesaj
      productListEl.innerHTML =
        "<p>Şu anda ürün listesine ulaşılamıyor. Lütfen API /products endpoint'ini kontrol et.</p>";
      return;
    }

    const products = await res.json();

    if (!Array.isArray(products) || products.length === 0) {
      productListEl.innerHTML =
        "<p>Henüz eklenmiş ürün yok. İlk ürünlerini yönetim panelinden ekleyebilirsin.</p>";
      return;
    }

    renderProductCards(products);
  } catch (err) {
    console.error("Ürün yükleme hatası:", err);
    productListEl.innerHTML =
      "<p>Ürünler alınırken bir sorun oluştu. Birazdan tekrar dene.</p>";
  }
}

// -----------------------------
// 3) ÜRÜN KARTLARINI RENDER ETME
// -----------------------------
function renderProductCards(products) {
  productListEl.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${product.imageUrl || "https://via.placeholder.com/400x260"}" alt="${product.name || "Ürün"}" />
      <h3>${product.name || "İsimsiz Ürün"}</h3>
      <p>${formatPrice(product.price)}</p>
    `;

    card.addEventListener("click", () => openProductDetail(product));
    productListEl.appendChild(card);
  });
}

// -----------------------------
// 4) FİYAT FORMATLAMA
// -----------------------------
function formatPrice(price) {
  if (price === undefined || price === null || isNaN(Number(price))) {
    return "Fiyat yakında";
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(price);
}

// -----------------------------
// 5) ÜRÜN DETAYI (GEÇİCİ ÇÖZÜM)
//    Şimdilik basit popup. Sonraki adımda
//    ayrı ürün detay sayfası yaparız.
// -----------------------------
function openProductDetail(product) {
  const name = product.name || "Ürün";
  const price = formatPrice(product.price);
  const sku = product.sku || "-";
  const stock = product.stock ?? "Belirtilmemiş";

  alert(
    `${name}\n\nFiyat: ${price}\nStok: ${stock}\nSKU: ${sku}\n\nDetay sayfası bir sonraki adımda ayrı ekran olacak.`
  );
}

// -----------------------------
// 6) ALT MENÜ TIKLAMALARI
// -----------------------------
function setupBottomMenu() {
  const links = document.querySelectorAll(".bottom-menu a");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.dataset.page;

      switch (target) {
        case "home":
          // Şu an bulunduğumuz ekran
          window.scrollTo({ top: 0, behavior: "smooth" });
          break;
        case "orders":
          alert("Siparişler ekranı, ikinci adımda gerçek sayfa olarak gelecek.");
          break;
        case "cart":
          alert("Sepet ekranı, ödeme entegrasyonu ile birlikte eklenecek.");
          break;
        case "profile":
          alert("Profil ekranı, giriş sistemi ile birlikte aktif olacak.");
          break;
        default:
          break;
      }
    });
  });
}

// -----------------------------
// 7) SAYFA YÜKLENİNCE ÇALIŞAN İLK FONKSİYONLAR
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  checkApiStatus();   // / -> sağlık ve servis adı
  loadProducts();     // /products -> gerçek ürün listesi
  setupBottomMenu();  // alt menü
});
