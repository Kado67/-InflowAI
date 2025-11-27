// ui.js
// InflowAI – Tek Sayfa (SPA) Ön Yüz Beyni
// Tüm butonları, akışları ve basit "yaşayan" davranışı yönetir.

document.addEventListener("DOMContentLoaded", () => {
  // ==============================
  // TEMEL STATE (GEÇİCİ / FRONTEND)
  // ==============================
  const state = {
    profession: null,
    totalContent: 0,
    totalProducts: 0,
    todayIdeas: 0,
    products: [],
    contents: [],
    feed: [],
    accRecords: [],
    totalIncome: 0,
    totalExpense: 0,
    recentActions: []
  };

  // ==============================
  // YARDIMCI FONKSİYONLAR
  // ==============================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function addRecentAction(text) {
    state.recentActions.unshift({
      text,
      time: new Date()
    });
    if (state.recentActions.length > 25) {
      state.recentActions.pop();
    }
    renderProfile();
  }

  function formatTime(date) {
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function updateStats() {
    $("#statTotalContent").textContent = state.totalContent;
    $("#statTotalProducts").textContent = state.totalProducts;
    $("#statTodayIdeas").textContent = state.todayIdeas;

    $("#profileTotalContent").textContent = state.totalContent;
    $("#profileTotalProducts").textContent = state.totalProducts;
  }

  function renderProducts() {
    const list = $("#productList");
    const empty = $("#productEmpty");

    list.innerHTML = "";
    if (state.products.length === 0) {
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    state.products.forEach((p) => {
      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `
        <div class="product-card-title">${p.name}</div>
        <div class="product-card-price">${p.price}</div>
        <div class="product-card-meta">
          Görünürlük: ${p.visibilityLabel}<br/>
          Kısa açıklama: ${p.shortDesc}
        </div>
      `;
      list.appendChild(div);
    });
  }

  function renderFeed() {
    const list = $("#feedList");
    const empty = $("#feedEmpty");
    list.innerHTML = "";

    if (state.feed.length === 0) {
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    const sorted = [...state.feed].sort((a, b) => b.time - a.time);

    sorted.forEach((item) => {
      const card = document.createElement("div");
      card.className = "product-card";
      const timeText = formatTime(new Date(item.time));

      let icon = "✨";
      if (item.kind === "content") icon = "⚡";
      if (item.kind === "product") icon = "🛒";
      if (item.kind === "fun") icon = "🤹";

      card.innerHTML = `
        <div class="product-card-title">${icon} ${item.title}</div>
        <div class="product-card-meta">
          ${item.detail}<br/>
          <span style="font-size:0.75rem; opacity:0.8;">${timeText}</span>
        </div>
      `;
      list.appendChild(card);
    });
  }

  function renderHomeFeedPreview() {
    const preview = $("#homeFeedPreview");
    preview.innerHTML = "";

    const sorted = [...state.feed].sort((a, b) => b.time - a.time).slice(0, 6);
    if (sorted.length === 0) {
      const emptyCard = document.createElement("div");
      emptyCard.className = "product-card";
      emptyCard.innerHTML =
        "<div class='product-card-meta'>Henüz bir hareket yok. İçerik üret veya ürün ekle, akış burada canlansın. 🚀</div>";
      preview.appendChild(emptyCard);
      return;
    }

    sorted.forEach((item) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <div class="product-card-title">${item.title}</div>
        <div class="product-card-meta">${item.detail}</div>
      `;
      preview.appendChild(card);
    });
  }

  function renderAccounting() {
    $("#accTotalIncome").textContent = `${state.totalIncome.toLocaleString("tr-TR")} ₺`;
    $("#accTotalExpense").textContent = `${state.totalExpense.toLocaleString("tr-TR")} ₺`;
    const balance = state.totalIncome - state.totalExpense;
    $("#accBalance").textContent = `${balance.toLocaleString("tr-TR")} ₺`;

    const list = $("#accList");
    list.innerHTML = "";
    state.accRecords
      .slice()
      .reverse()
      .forEach((r) => {
        const li = document.createElement("li");
        li.textContent = `${formatTime(r.time)} – ${r.type === "income" ? "Gelir" : "Gider"}: ${
          r.amount
        } ₺ – ${r.note || "Not yok"}`;
        list.appendChild(li);
      });
  }

  function renderProfile() {
    const ul = $("#profileRecentItems");
    ul.innerHTML = "";
    if (state.recentActions.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Henüz bir hareket yok. İçerik üret, ürün ekle veya eğlence alanını kullan.";
      ul.appendChild(li);
      return;
    }

    state.recentActions.slice(0, 12).forEach((a) => {
      const li = document.createElement("li");
      li.textContent = `[${formatTime(a.time)}] ${a.text}`;
      ul.appendChild(li);
    });

    if (state.profession) {
      $("#profileInfo").textContent =
        "Mesleğin: " +
        state.professionLabel +
        ". InflowAI ekranlarını buna göre kişiselleştiriyor.";
    }
  }

  function setAvatarMessage(msg) {
    const bubble = $("#avatarBubble");
    if (!bubble) return;
    bubble.innerHTML = msg;
  }

  // ==============================
  // SAYFA GEÇİŞLERİ
  // ==============================
  function showPage(key) {
    $$(".page").forEach((page) => {
      page.classList.remove("active");
    });
    const target = document.getElementById(`page-${key}`);
    if (target) {
      target.classList.add("active");
    }

    $$(".nav-btn").forEach((btn) => {
      if (btn.dataset.go === key) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    if (key === "home") {
      renderHomeFeedPreview();
    }
  }

  // Nav butonları
  $$(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.go;
      showPage(target);
    });
  });

  // Hızlı chip butonları
  $$(".chip-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.go;
      showPage(target);
    });
  });

  // Dil butonu (TR/EN basit toggle)
  const btnLang = $("#btnLang");
  if (btnLang) {
    btnLang.addEventListener("click", () => {
      btnLang.textContent = btnLang.textContent === "TR" ? "EN" : "TR";
    });
  }

  // Giriş butonu (şimdilik gösterim amaçlı)
  const btnLogin = $("#btnLogin");
  if (btnLogin) {
    btnLogin.addEventListener("click", () => {
      alert(
        "Giriş sistemi backend ile bağlandığında aktif olacak.\nŞimdilik platformu misafir olarak kullanmaya devam edebilirsin."
      );
    });
  }

  // ==============================
  // MESLEK SEÇİMİ VE PLATFORMU HAZIRLAMA
  // ==============================
  const professionSelect = $("#professionSelect");
  const btnStartFlow = $("#btnStartFlow");

  if (btnStartFlow && professionSelect) {
    btnStartFlow.addEventListener("click", () => {
      const value = professionSelect.value;
      if (!value) {
        setAvatarMessage(
          "Önce mesleğini seç kurban 💜<br/>İçerikçi misin, esnaf mısın, muhasebeci mi, doktor mu?"
        );
        return;
      }

      state.profession = value;

      let label = "";
      let target = "home";
      switch (value) {
        case "content":
          label = "İçerik Üreticisi / Influencer";
          target = "content";
          break;
        case "ecommerce":
          label = "E-Ticaret / Esnaf / Mağaza Sahibi";
          target = "commerce";
          break;
        case "b2b":
          label = "İşletme Sahibi / Girişimci";
          target = "b2b";
          break;
        case "accountant":
          label = "Muhasebe / Finans";
          target = "accounting";
          break;
        case "doctor":
          label = "Doktor / Sağlık";
          target = "content";
          break;
        case "teacher":
          label = "Öğretmen / Öğrenci";
          target = "content";
          break;
        case "engineer":
          label = "İnşaat / Usta / Mühendis";
          target = "b2b";
          break;
        case "chef":
          label = "Aşçı / Kafe / Restoran";
          target = "commerce";
          break;
        case "freelancer":
          label = "Freelancer / Yazılımcı / Tasarımcı";
          target = "content";
          break;
        default:
          label = "Genel ziyaretçi";
          target = "home";
      }

      state.professionLabel = label;

      setAvatarMessage(
        `Tamam kurban 💜<br/><strong>${label}</strong> olarak geldin.<br/>Senin için en uygun ekranları açıyorum.`
      );
      addRecentAction(`Meslek seçimi: ${label}`);
      renderProfile();
      showPage(target);
    });
  }

  // ==============================
  // İÇERİK ÜRETİCİ
  // ==============================
  const btnGenerateContent = $("#btnGenerateContent");
  if (btnGenerateContent) {
    btnGenerateContent.addEventListener("click", () => {
      const type = $("#contentType").value;
      const input = $("#contentInput").value.trim();
      const output = $("#contentResult");

      if (!input) {
        output.textContent = "Önce içerik konusunu kısaca yaz kurban. 🙂";
        return;
      }

      let title = "";
      let detail = "";

      if (type === "short") {
        title = "Kısa Video Fikri";
        detail = `Reels/Shorts için fikir: ${input} konusuyla alakalı, hızlı giriş–orta–final içeren 10-15 saniyelik bir senaryo tasarla. Konu: "${input}".`;
      } else if (type === "post") {
        title = "Gönderi Metni";
        detail = `Sosyal medya gönderisi için vurucu bir metin: "${input}" temalı, girişte dikkat çekici, sonda çağrı içeren 2–3 cümlelik text oluştur.`;
      } else if (type === "product") {
        title = "Ürün Açıklaması";
        detail = `Ürün açıklaması: "${input}" için özellik, fayda ve duygusal vurgu içeren bir satış metni yaz.`;
      } else if (type === "blog") {
        title = "Blog Taslağı";
        detail = `Blog taslağı: "${input}" konusunda başlıklar, alt başlıklar ve giriş–gelişme–sonuç akışını planla.`;
      } else if (type === "story") {
        title = "Hikâye Metni";
        detail = `"${input}" için kısa ama etkileyici bir hikâye fikri: girişte merak uyandır, ortada olayları sıkıştır, finalde duygusal bir kapanış yap.`;
      } else {
        title = "İçerik Fikri";
        detail = `"${input}" için genel bir içerik fikri üret.`;
      }

      // Ekrana yaz
      output.innerHTML = `<strong>${title}</strong><br/>${detail}`;

      // State güncelle
      const now = Date.now();
      state.totalContent += 1;
      state.todayIdeas += 1;
      state.contents.push({
        type,
        input,
        title,
        detail,
        time: now
      });
      state.feed.push({
        kind: "content",
        title,
        detail,
        time: now
      });

      addRecentAction(`Yeni içerik üretildi: ${title}`);
      updateStats();
      renderFeed();
      renderHomeFeedPreview();
    });
  }

  // ==============================
  // E-TİCARET / ÜRÜN EKLEME
  // ==============================
  const btnAddProduct = $("#btnAddProduct");
  if (btnAddProduct) {
    btnAddProduct.addEventListener("click", () => {
      const nameEl = $("#productName");
      const priceEl = $("#productPrice");
      const descEl = $("#productDescription");
      const visEl = $("#productVisibility");
      const resultEl = $("#productAddResult");

      const name = nameEl.value.trim();
      const price = priceEl.value.trim();
      const desc = descEl.value.trim();
      const visibility = visEl.value;

      if (!name || !price) {
        resultEl.textContent = "Ürün adı ve fiyatını doldur kurban. 🛒";
        return;
      }

      let visibilityLabel = "Herkese açık";
      if (visibility === "followers") visibilityLabel = "Takipçilere özel";
      if (visibility === "vip") visibilityLabel = "VIP / özel satış";

      const shortDesc = desc || "Bu ürünün açıklaması InflowAI tarafından zenginleştirilebilir.";

      const product = {
        name,
        price,
        desc: shortDesc,
        visibility,
        visibilityLabel,
        time: Date.now()
      };

      state.products.push(product);
      state.totalProducts += 1;

      state.feed.push({
        kind: "product",
        title: `Yeni ürün: ${name}`,
        detail: `${price} – ${visibilityLabel}`,
        time: product.time
      });

      addRecentAction(`Yeni ürün eklendi: ${name}`);
      updateStats();
      renderProducts();
      renderFeed();
      renderHomeFeedPreview();

      nameEl.value = "";
      priceEl.value = "";
      descEl.value = "";
      resultEl.textContent = "Ürün başarıyla eklendi. 🎉";
    });
  }

  // ==============================
  // B2B / İŞLETME PANELİ
  // ==============================
  const btnB2BPlan = $("#btnB2BPlan");
  if (btnB2BPlan) {
    btnB2BPlan.addEventListener("click", () => {
      const txt = $("#b2bAbout").value.trim();
      const out = $("#b2bResult");
      if (!txt) {
        out.textContent = "Önce işletmeni kısaca anlat kurban. 😊";
        return;
      }

      const plan = `
<strong>InflowAI Haftalık Plan Özeti</strong><br/><br/>
<strong>İşletme:</strong> ${txt}<br/><br/>
<strong>1) İçerik Planı</strong><br/>
- Haftada en az 3 kısa video (Reels/Shorts) – işletmeni sahneden anlat.<br/>
- Haftada 2 ürün odaklı paylaşım – ürün özelliklerini göster.<br/>
- Haftada 1 “sahne arkası” paylaşım – güven ve samimiyet için.<br/><br/>
<strong>2) Satış Planı</strong><br/>
- En çok satma potansiyeli olan 1–3 ürünü öne çıkar.<br/>
- Haftalık mini kampanya (küçük indirim, ikinci ürüne avantaj vb.).<br/>
- DM veya WhatsApp ile soruları hızlı cevapla.<br/><br/>
<strong>3) Büyüme / B2B Öneriler</strong><br/>
- En çok etkileşim alan içerikleri tekrar formatla ve yeniden paylaş.<br/>
- Benzer işletmelerin içerik stilini incele, kendine göre güncelle.<br/>
- InflowAI içerisindeki muhasebe özetinden kâr–zarar dengesini takip et.<br/><br/>
Bu plan her hafta InflowAI tarafından güncellenebilir. 🧠
`;

      out.innerHTML = plan;
      addRecentAction("B2B haftalık plan oluşturuldu.");
    });
  }

  // ==============================
  // MUHASEBE / FİNANS
  // ==============================
  const btnAccAdd = $("#btnAccAdd");
  if (btnAccAdd) {
    btnAccAdd.addEventListener("click", () => {
      const type = $("#accType").value;
      const amountRaw = $("#accAmount").value;
      const note = $("#accNote").value.trim();

      const amount = Number(amountRaw);
      if (!amount || amount <= 0) {
        alert("Tutarı pozitif bir sayı olarak gir kurban.");
        return;
      }

      const rec = {
        type,
        amount,
        note,
        time: new Date()
      };

      state.accRecords.push(rec);
      if (type === "income") {
        state.totalIncome += amount;
      } else {
        state.totalExpense += amount;
      }

      renderAccounting();
      addRecentAction(
        `${type === "income" ? "Gelir" : "Gider"} kaydedildi: ${amount} ₺ (${note || "Not yok"})`
      );

      $("#accAmount").value = "";
      $("#accNote").value = "";
    });
  }

  // ==============================
  // EĞLENCE ALANI
  // ==============================
  const btnCoffee = $("#btnCoffee");
  const btnHoroscope = $("#btnHoroscope");
  const btnAdvice = $("#btnAdvice");
  const btnQuiz = $("#btnQuiz");

  function setFunResult(title, body) {
    $("#funResultTitle").textContent = title;
    $("#funResultBody").textContent = body;
  }

  if (btnCoffee) {
    btnCoffee.addEventListener("click", () => {
      setFunResult(
        "Kahve Falı 🌙",
        "Fincanında büyük bir yol görünüyor kurban. Bu yol yeni bir proje, yeni müşteriler veya hayatında açılacak yepyeni bir sayfa olabilir. İçine sinen ilk fikre doğru küçük bir adım at, InflowAI gerektiğinde yanında."
      );
      state.feed.push({
        kind: "fun",
        title: "Kahve falı bakıldı",
        detail: "Yeni bir yol, yeni fırsatlar göründü.",
        time: Date.now()
      });
      addRecentAction("Kahve falı modu kullanıldı.");
      renderFeed();
      renderHomeFeedPreview();
    });
  }

  if (btnHoroscope) {
    btnHoroscope.addEventListener("click", () => {
      setFunResult(
        "Burç / Tarot 🔮",
        "Bugün sezgilerin normalden güçlü. Karar alırken biraz iç sesini, biraz da veriyi dinlersen çok dengeli hareket edersin. Üretmekten korkma, hatadan öğrenen kazanır."
      );
      state.feed.push({
        kind: "fun",
        title: "Burç / tarot yorumu",
        detail: "Sezgilerin ve üretim gücün öne çıkıyor.",
        time: Date.now()
      });
      addRecentAction("Burç / tarot modu kullanıldı.");
      renderFeed();
      renderHomeFeedPreview();
    });
  }

  if (btnAdvice) {
    btnAdvice.addEventListener("click", () => {
      const advices = [
        "Küçük de olsa bugün bir içerik üret, gelecekte sana büyük kapı açabilir.",
        "Bugün bir ürününü ya da hizmetini, daha önce görmemiş birine göster.",
        "Yorulduysan mola ver ama tamamen bırakma. Süreklilik, mükemmellikten güçlüdür.",
        "En zayıf olduğunu düşündüğün yanına odaklan; oradaki gelişme seni şaşırtır.",
        "Not al: Aklına gelen iyi fikirler saniyeler içinde uçup gider."
      ];
      const pick = advices[Math.floor(Math.random() * advices.length)];
      setFunResult("Günün Tavsiyesi 💡", pick);
      state.feed.push({
        kind: "fun",
        title: "Günün tavsiyesi",
        detail: pick,
        time: Date.now()
      });
      addRecentAction("Günün tavsiyesi alındı.");
      renderFeed();
      renderHomeFeedPreview();
    });
  }

  if (btnQuiz) {
    btnQuiz.addEventListener("click", () => {
      setFunResult(
        "Mini Test 😄",
        "Soru: Önümüzdeki 7 gün içinde en az kaç içerik üretmek istiyorsun?\n\nA) 0 – Sadece izlerim\nB) 1–3 – Yavaş yavaş başlarım\nC) 4–10 – Ciddi deneme yaparım\nD) 10+ – Bu işi ciddiye alıyorum\n\nCevabın ne olursa olsun, InflowAI yanında."
      );
      state.feed.push({
        kind: "fun",
        title: "Mini test gösterildi",
        detail: "Önümüzdeki 7 gün için içerik hedefini düşün.",
        time: Date.now()
      });
      addRecentAction("Mini test görüntülendi.");
      renderFeed();
      renderHomeFeedPreview();
    });
  }

  // ==============================
  // BASİT "YAŞAYAN" DAVRANIŞ
  // ==============================
  // Avatar balonunu ara ara güncelleyen hafif bir sistem
  const avatarPhrases = [
    "Bugün tek bir şey üretmen bile yarın hayatını değiştirebilir kurban. 💜",
    "İstersen sadece gez, InflowAI her tıklamandan bir şey öğreniyor.",
    "Bir ürün ekle, bir içerik üret; gerisini platforma bırak.",
    "B2B paneli işletmeler için gizli silahın gibi düşünebilirsin.",
    "Eğlence alanı moral depolamak için her zaman açık. 🤹"
  ];
  let avatarIndex = 0;

  setInterval(() => {
    // Sadece ana sayfa görüldüğünde döndür
    const homeActive = $("#page-home")?.classList.contains("active");
    if (!homeActive) return;

    avatarIndex = (avatarIndex + 1) % avatarPhrases.length;
    setAvatarMessage(avatarPhrases[avatarIndex]);
  }, 16000); // 16 saniyede bir hafif güncelleme

  // Başlangıç görünümü
  showPage("home");
  updateStats();
  renderProducts();
  renderFeed();
  renderHomeFeedPreview();
  renderAccounting();
  renderProfile();
});
```0
