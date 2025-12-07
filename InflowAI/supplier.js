const API = "https://inflowai-api.onrender.com/api";
const token = localStorage.getItem("token");

if (!token) {
  alert("Giriş yapmanız gerekiyor.");
  window.location.href = "supplier_login.html";
}

// Ürün ekleme
document.getElementById("addProduct").onclick = async () => {
  const name = document.getElementById("pname").value;
  const price = document.getElementById("pprice").value;
  const stock = document.getElementById("pstock").value;
  const imageFile = document.getElementById("pimage").files[0];
  const msg = document.getElementById("panelMsg");

  msg.textContent = "İşlem yapılıyor...";

  // Foto yükleme
  let imageUrl = "";
  if (imageFile) {
    const form = new FormData();
    form.append("image", imageFile);

    const uploadRes = await fetch(API + "/upload/image", {
      method: "POST",
      body: form,
    });

    const uploadData = await uploadRes.json();
    imageUrl = uploadData.url;
  }

  // Ürün ekle
  const res = await fetch(API + "/supplier/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ name, price, stock, images: [imageUrl] }),
  });

  const data = await res.json();

  if (!res.ok) {
    msg.textContent = data.message || "Ürün eklenemedi!";
    msg.style.color = "#b91c1c";
    return;
  }

  msg.textContent = "Ürün başarıyla eklendi!";
  msg.style.color = "#15803d";

  loadProducts();
};

// Ürün listeleme
async function loadProducts() {
  const box = document.getElementById("myProducts");
  box.innerHTML = "Yükleniyor...";

  const res = await fetch(API + "/supplier/products", {
    headers: { Authorization: "Bearer " + token },
  });

  const data = await res.json();

  if (!res.ok) {
    box.textContent = "Hata oluştu.";
    return;
  }

  box.innerHTML = "";

  data.products.forEach((p) => {
    box.innerHTML += `
      <div class="product-row">
        <img src="${p.images?.[0] || ""}" width="60">
        <div>${p.name}</div>
        <div>${p.price}₺</div>
        <div>Stok: ${p.stock}</div>
      </div>
    `;
  });
}

loadProducts();
