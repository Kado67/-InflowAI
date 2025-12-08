// supplier.js
const API_URL = "https://inflowai-api.onrender.com/api";
const supplierToken = getToken();

if (!supplierToken || !getUser() || getUser().role !== "supplier") {
  alert("Tedarikçi girişi gerekli.");
  window.location.href = "supplier_login.html";
}

// KATEGORİ LİSTESİNİ PANELDEKİ SELECT'E YÜKLE
async function loadCategoriesForSupplier() {
  const select = document.getElementById("pcategory");
  if (!select) return;

  // Varsayılan "Seçiniz"
  let optionsHtml = `<option value="">Seçiniz</option>`;

  try {
    const res  = await fetch(API_URL + "/categories");
    const data = await res.json();

    if (res.ok && data && data.categories && data.categories.length) {
      data.categories.forEach((c) => {
        // VALUE = ObjectId
        optionsHtml += `<option value="${c._id}">${c.name}</option>`;
      });
    }
    // Kategori yoksa ekstra seçenek yok → ürünler kategorisiz kaydedilir
  } catch (e) {
    console.error("Kategori listesi alınamadı:", e);
    // Hata varsa yine sadece "Seçiniz" kalsın
  }

  select.innerHTML = optionsHtml;
}

// ÜRÜN EKLE
document.getElementById("addProduct").onclick = async () => {
  const name      = document.getElementById("pname").value;
  const price     = document.getElementById("pprice").value;
  const stock     = document.getElementById("pstock").value;
  const categoryId = document.getElementById("pcategory").value; // ObjectId veya ""
  const imageFile = document.getElementById("pimage").files[0];
  const msg       = document.getElementById("panelMsg");

  if (!name || !price || !stock) {
    msg.textContent = "Lütfen ürün adı, fiyat ve stok alanlarını doldurun.";
    msg.style.color = "#b91c1c";
    return;
  }

  msg.textContent = "İşlem yapılıyor...";

  let imageUrl = "";
  if (imageFile) {
    const form = new FormData();
    form.append("image", imageFile);
    try {
      const uploadRes  = await fetch(API_URL + "/upload/image", {
        method: "POST",
        body: form,
      });
      const uploadData = await uploadRes.json();
      if (uploadRes.ok) {
        imageUrl = uploadData.url || "";
      }
    } catch (e) {
      console.error("Görsel yüklenemedi:", e);
    }
  }

  try {
    const payload = {
      name,
      price,
      stock,
      images: imageUrl ? [imageUrl] : [],
    };

    // Yalnızca gerçekten seçilmiş kategori ID'si varsa gönder
    if (categoryId) {
      payload.category = categoryId; // ObjectId string
    }

    const res = await fetch(API_URL + "/supplier/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + supplierToken,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.message || "Ürün eklenemedi.";
      msg.style.color = "#b91c1c";
      return;
    }

    msg.textContent = "Ürün eklendi.";
    msg.style.color = "#16a34a";

    document.getElementById("pname").value = "";
    document.getElementById("pprice").value = "";
    document.getElementById("pstock").value = "";
    document.getElementById("pcategory").value = "";
    document.getElementById("pimage").value = "";

    loadProducts();
  } catch (e) {
    console.error(e);
    msg.textContent = "Sunucuyla bağlantı kurulamadı.";
    msg.style.color = "#b91c1c";
  }
};

// TEDARİKÇİ ÜRÜNLERİNİ LİSTELE
async function loadProducts() {
  const box = document.getElementById("myProducts");
  if (!box) return;

  box.innerHTML = "Yükleniyor...";

  try {
    const res  = await fetch(API_URL + "/supplier/products", {
      headers: { Authorization: "Bearer " + supplierToken },
    });
    const data = await res.json();

    if (!res.ok) {
      box.textContent = data.message || "Hata oluştu.";
      return;
    }

    const products = data.products || data;

    if (!products.length) {
      box.textContent = "Henüz bir ürün eklemediniz.";
      return;
    }

    box.innerHTML = "";
    products.forEach((p) => {
      box.innerHTML += `
        <div class="product-row">
          <img src="${p.images?.[0] || ""}">
          <div>
            <div>${p.name}</div>
            <div>${p.price}₺ · Stok: ${p.stock}</div>
            <div style="font-size:11px;color:#6b7280;">
              Kategori: ${p.category || "-"}
            </div>
          </div>
        </div>`;
    });
  } catch (e) {
    console.error(e);
    box.textContent = "Ürünler alınırken hata oluştu.";
  }
}

// SAYFA YÜKLENİNCE ÇALIŞ
loadCategoriesForSupplier();
loadProducts();
