// Basit SPA state
const panels = document.querySelectorAll(".panel");
const panelButtons = document.querySelectorAll("[data-panel-target]");
const bottomButtons = document.querySelectorAll(".bottom-btn");

// Panel değiştirme
function setActivePanel(id) {
  panels.forEach((p) => p.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");

  bottomButtons.forEach((b) =>
    b.classList.toggle("active", b.dataset.panelTarget === id)
  );
}

panelButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.panelTarget;
    if (target) setActivePanel(target);
  });
});

// Timeline verisi
const timelineData = [
  { text: "Yeni kullanıcı kayıt oldu.", time: "Şimdi" },
  { text: "2 ürün sepete eklendi.", time: "5 dk" },
  { text: "Bir teklif onaylandı (B2B).", time: "12 dk" }
];

const timelineList = document.getElementById("timeline-list");
timelineData.forEach((item) => {
  const li = document.createElement("li");
  li.className = "timeline-item";
  li.innerHTML = `
    <span>${item.text}</span>
    <span class="timeline-meta">${item.time}</span>
  `;
  timelineList.appendChild(li);
});

// Basit sayaçlar
document.getElementById("stat-users").textContent = "128";
document.getElementById("stat-actions").textContent = "342";

// E-Ticaret dummy ürünler
const productData = [
  { title: "AI Laptop Pro", price: "$999", tag: "tech" },
  { title: "Stüdyo Kulaklık", price: "$199", tag: "tech" },
  { title: "Minimal Sırt Çantası", price: "$79", tag: "fashion" },
  { title: "Akıllı Lamba", price: "$49", tag: "home" }
];

const productList = document.getElementById("product-list");
function renderProducts(filter = "all") {
  productList.innerHTML = "";
  productData
    .filter((p) => filter === "all" || p.tag === filter)
    .forEach((p) => {
      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `
        <div class="product-title">${p.title}</div>
        <div class="product-meta">
          <span class="product-price">${p.price}</span>
          <span class="product-tag">${p.tag}</span>
        </div>
      `;
      productList.appendChild(div);
    });
}
renderProducts();

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document
      .querySelectorAll(".chip")
      .forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    renderProducts(chip.dataset.category);
  });
});

// Sosyal akış
const feedData = [
  {
    name: "Merve Kaya",
    time: "3 dk",
    text: "Yeni AI destekli ürün sayfam yayında 🎉"
  },
  {
    name: "Global Studio",
    time: "12 dk",
    text: "Bugün 42 içerik ve 18 satış gerçekleşti."
  },
  {
    name: "InflowAI",
    time: "1 s",
    text: "Platform çekirdeği kendini optimize etti."
  }
];

const feedList = document.getElementById("feed-list");
feedData.forEach((item) => {
  const card = document.createElement("article");
  card.className = "feed-card";
  card.innerHTML = `
    <div class="feed-header">
      <div class="feed-avatar"></div>
      <span class="feed-name">${item.name}</span>
      <span class="feed-time">${item.time}</span>
    </div>
    <div class="feed-text">${item.text}</div>
  `;
  feedList.appendChild(card);
});

// Mesajlaşma listesi
const chatData = [
  {
    name: "Anna Green",
    preview: "Buluşmayı yarına alalım mı?",
    time: "09:24"
  },
  {
    name: "Alex Johnson",
    preview: "Dashboard çok iyi çalışıyor 👌",
    time: "08:11"
  },
  { name: "Design Team", preview: "Yeni tema hazır.", time: "Dün" }
];

const chatList = document.getElementById("chat-list");
chatData.forEach((c) => {
  const li = document.createElement("li");
  li.className = "chat-item";
  li.innerHTML = `
    <div class="chat-avatar"></div>
    <div class="chat-main">
      <div class="chat-name">${c.name}</div>
      <div class="chat-preview">${c.preview}</div>
    </div>
    <div class="chat-meta">${c.time}</div>
  `;
  chatList.appendChild(li);
});

// Mesaj gönderme (dummy olarak listeye ekliyor)
const chatInput = document.getElementById("chat-input");
const chatSendBtn = document.getElementById("chat-send-btn");

chatSendBtn.addEventListener("click", () => {
  const value = chatInput.value.trim();
  if (!value) return;
  const li = document.createElement("li");
  li.className = "chat-item";
  li.innerHTML = `
    <div class="chat-avatar"></div>
    <div class="chat-main">
      <div class="chat-name">Sen</div>
      <div class="chat-preview">${value}</div>
    </div>
    <div class="chat-meta">Şimdi</div>
  `;
  chatList.prepend(li);
  chatInput.value = "";
});

// Aramalar
const callData = [
  { name: "Mustafa", sub: "Görüntülü arama • 3 dk", type: "Başarılı" },
  { name: "Murat", sub: "Sesli arama • Cevapsız", type: "Cevapsız" },
  { name: "Global CRM", sub: "Toplantı • 25 dk", type: "Başarılı" }
];

const callList = document.getElementById("call-list");
callData.forEach((c) => {
  const li = document.createElement("li");
  li.className = "call-item";
  li.innerHTML = `
    <div class="call-main">
      <span class="call-name">${c.name}</span>
      <span class="call-sub">${c.sub}</span>
    </div>
    <span class="call-badge">${c.type}</span>
  `;
  callList.appendChild(li);
});

// Eğlence / tarot
const tarotRow = document.getElementById("tarot-row");
const tarotCards = [
  { id: "enerji", label: "Enerji" },
  { id: "firsat", label: "Fırsat" },
  { id: "denge", label: "Denge" }
];

tarotCards.forEach((card) => {
  const div = document.createElement("div");
  div.className = "tarot-card";
  div.dataset.id = card.id;
  div.innerHTML = `<span class="tarot-label">${card.label}</span>`;
  tarotRow.appendChild(div);
});

const tarotResult = document.getElementById("tarot-result");
tarotRow.addEventListener("click", (e) => {
  const card = e.target.closest(".tarot-card");
  if (!card) return;
  const id = card.dataset.id;
  let text = "";
  if (id === "enerji") {
    text = "Bugün platformun enerjisi çok yüksek: yeni fikirler ve trafik akışı artacak.";
  } else if (id === "firsat") {
    text = "Yeni bir iş birliği veya satış fırsatı kapıda. B2B alanına göz at.";
  } else if (id === "denge") {
    text = "Gelir-gider, iş-eğlence dengesini korursan büyüme kalıcı olacak.";
  }
  tarotResult.textContent = text;
});

// Muhasebe
const financeRows = [
  { date: "01.12", desc: "Abonelik geliri", type: "Gelir", amount: "+4.200 ₺" },
  { date: "01.12", desc: "Sunucu maliyeti", type: "Gider", amount: "-950 ₺" },
  { date: "02.12", desc: "Reklam geliri", type: "Gelir", amount: "+1.800 ₺" }
];

const financeTableBody = document.querySelector("#finance-table tbody");
let income = 0;
let expense = 0;

financeRows.forEach((row) => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${row.date}</td>
    <td>${row.desc}</td>
    <td>${row.type}</td>
    <td>${row.amount}</td>
  `;
  financeTableBody.appendChild(tr);

  const numeric = parseInt(row.amount.replace(/[^\d-]/g, ""), 10);
  if (row.type === "Gelir") income += numeric;
  else expense += Math.abs(numeric);
});

document.getElementById("finance-income").textContent = income.toLocaleString("tr-TR") + " ₺";
document.getElementById("finance-expense").textContent = expense.toLocaleString("tr-TR") + " ₺";

// B2B listeleri
const clients = ["Nova Studio", "Global Mart", "TechHub", "Cafe 42"];
const projects = [
  "Nova • Sosyal medya paketi",
  "Global Mart • E-ticaret entegrasyonu",
  "TechHub • B2B panel tasarımı"
];

const b2bClientList = document.getElementById("b2b-client-list");
clients.forEach((c) => {
  const li = document.createElement("li");
  li.className = "b2b-item";
  li.textContent = c;
  b2bClientList.appendChild(li);
});

const b2bProjectList = document.getElementById("b2b-project-list");
projects.forEach((p) => {
  const li = document.createElement("li");
  li.className = "b2b-item";
  li.textContent = p;
  b2bProjectList.appendChild(li);
});

// Dil butonu (şimdilik sadece görsel toggle)
const langBtn = document.querySelector("[data-lang-toggle]");
if (langBtn) {
  langBtn.addEventListener("click", () => {
    langBtn.textContent = langBtn.textContent === "TR" ? "EN" : "TR";
  });
             }
