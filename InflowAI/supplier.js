const API_URL = "https://inflowai-api.onrender.com/api";
const supplierToken = getToken();
if (!supplierToken || !getUser() || getUser().role !== "supplier") {
  alert("Tedarikçi girişi gerekli.");
  window.location.href = "supplier_login.html";
}

// Ürün ekle
document.getElementById("addProduct").onclick = async () => {
  const name = document.getElementById("pname").value;
  const price = document.getElementById("pprice").value;
  const stock = document.getElementById("pstock").value;
  const imageFile = document.getElementById("pimage").files[0];
  const msg = document.getElementById("panelMsg");

  if (!name || !price || !stock) {
    msg.textContent = "Lütfen tüm alanları doldurun.";
    msg.style.color = "#b91c1c";
    return;
  }

  msg.textContent = "İşlem yapılıyor...";

  let imageUrl = "";
  if (imageFile) {
    const form = new FormData();
    form.append("image", imageFile);
    const uploadRes = await fetch(API_URL + "/upload/image", {
      method: "POST",
      body: form
    });
    const uploadData = await uploadRes.json();
    imageUrl = uploadData.url || "";
  }

  const res = await fetch(API_URL + "/supplier/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + supplierToken
    },
    body: JSON.stringify({ name, price, stock, images: [imageUrl] })
  });
  const data = await res.json();

  if (!res.ok) {
    msg.textContent = data.message || "Ürün eklenemedi.";
    msg.style.color = "#b91c1c";
    return;
  }

  msg.textContent = "Ürün eklendi.";
  msg.style.color = "#16a34a";
  loadProducts();
};

// Ürünleri listele
async function loadProducts() {
  const box = document.getElementById("myProducts");
  box.innerHTML = "Yükleniyor...";
  const res = await fetch(API_URL + "/supplier/products", {
    headers: { Authorization: "Bearer " + supplierToken }
  });
  const data = await res.json();
  if (!res.ok) {
    box.textContent = "Hata oluştu.";
    return;
  }
  box.innerHTML = "";
  data.products.forEach(p => {
    box.innerHTML += `
      <div class="product-row">
        <img src="${p.images?.[0] || ''}">
        <div>
          <div>${p.name}</div>
          <div>${p.price}₺ · Stok: ${p.stock}</div>
        </div>
      </div>`;
  });
}
loadProducts();
