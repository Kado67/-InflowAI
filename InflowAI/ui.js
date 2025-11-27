// ui.js
// InflowAI - Ön Yüz Beyni
// 7 sayfalı, tek HTML / CSS / JS ile tam çalışan demo mantığı

document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------------------------------
   *  TEMEL SEÇİCİLER + DURUM
   * ------------------------------------------------ */
  const pages = document.querySelectorAll(".page");
  const navButtons = document.querySelectorAll(".nav-btn");
  const feedTabs = document.querySelectorAll(".feed-tab");
  const homeFeed = document.getElementById("homeFeed");

  const avatarBubble = document.getElementById("avatarBubble");
  const toast = document.getElementById("toast");

  // Stats
  const statContents = document.getElementById("statContents");
  const statProducts = document.getElementById("statProducts");
  const statUsers = document.getElementById("statUsers");
  const statIdeas = document.getElementById("statIdeas");

  // Forms & outputs
  const formAddProduct = document.getElementById("formAddProduct");
  const productAiOutput = document.getElementById("productAiOutput");

  const megaTopic = document.getElementById("megaTopic");
  const btnMegaGenerate = document.getElementById("btnMegaGenerate");
  const megaOutput = document.getElementById("megaOutput");
  const b2bSector = document.getElementById("b2bSector");
  const btnB2BPlan = document.getElementById("btnB2BPlan");
  const b2bOutput = document.getElementById("b2bOutput");

  const formCreatePost = document.getElementById("formCreatePost");
  const postAiOutput = document.getElementById("postAiOutput");

  const funOutput = document.getElementById("funOutput");

  // Profil
  const profileName = document.getElementById("profileName");
  const profileBio = document.getElementById("profileBio");
  const profilePostsEl = document.getElementById("profilePosts");
  const profileProductsEl = document.getElementById("profileProducts");
  const profileFollowersEl = document.getElementById("profileFollowers");
  const profileFollowingEl = document.getElementById("profileFollowing");
  const profilePostsList = document.getElementById("profilePostsList");
  const profileProductsList = document.getElementById("profileProductsList");

  // Ürün detay
  const productDetailBox = document.getElementById("productDetailBox");
  const btnBackFromProduct = document.getElementById("btnBackFromProduct");

  // Hızlı butonlar
  const btnQuickCreate = document.getElementById("btnQuickCreate");
  const btnQuickProduct = document.getElementById("btnQuickProduct");
  const btnLogin = document.getElementById("btnLogin");

  // Basit durum objesi
  const state = {
    products: [], // {id, name, desc, price, category, image, video, createdAt}
    posts: [], // {id, type, platform, text, createdAt}
    aiItems: [], // {id, title, body, tag, createdAt}
    stats: {
      contents: 0,
      products: 0,
      users: 1,
      ideas: 0,
    },
    currentFeedFilter: "all",
    currentProduct: null,
  };

  let idCounter = 1;

  function genId() {
    return idCounter++;
  }

  /* ------------------------------------------------
   *  TOAST & PAGE GEÇİŞ
   * ------------------------------------------------ */
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function switchPage(pageKey) {
    pages.forEach((p) => p.classList.remove("page-active"));
    const target = document.getElementById(`page-${pageKey}`);
    if (target) target.classList.add("page-active");

    navButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-page") === pageKey);
    });

    // Ana sayfaya dönüşte feed'i tazele
    if (pageKey === "home") {
      renderFeed();
    }
  }

  /* ------------------------------------------------
   *  AVATAR KONUŞMA DÖNGÜSÜ
   * ------------------------------------------------ */
  const avatarMessages = [
    "Hoş geldin, bugün ne üretmek istiyorsun? 💜",
    "Tek cümle yaz, tüm platformlar için içerik hazırlayayım. ⚡",
    "Ürünün mü var, fikir mi arıyorsun? Yaz gitsin. ✨",
    "Seni TikTok’ta, Instagram’da, X’te bir yıldız yapabiliriz. 😎",
    "Kafandaki ürünü dünyaya duyuralım mı? 🚀",
  ];
  let avatarIndex = 0;

  if (avatarBubble) {
    setInterval(() => {
      avatarIndex = (avatarIndex + 1) % avatarMessages.length;
      avatarBubble.textContent = avatarMessages[avatarIndex];
    }, 9000);
  }

  /* ------------------------------------------------
   *  STATS GÜNCELLEME
   * ------------------------------------------------ */
  function updateStats() {
    state.stats.contents = state.posts.length + state.aiItems.length;
    state.stats.products = state.products.length;
    // Kullanıcı sayısı şimdilik sabit 1 (misafir) gibi, ileride dinamik olur
    state.stats.ideas = state.stats.contents * 3;

    if (statContents) statContents.textContent = state.stats.contents;
    if (statProducts) statProducts.textContent = state.stats.products;
    if (statUsers) statUsers.textContent = state.stats.users;
    if (statIdeas) statIdeas.textContent = state.stats.ideas;
  }

  /* ------------------------------------------------
   *  FEED ÖĞELERİ ÜRETİMİ
   * ------------------------------------------------ */
  function createContentCard(item) {
    const div = document.createElement("div");
    div.className = "feed-item";
    const created = new Date(item.createdAt).toLocaleString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

    div.innerHTML = `
      <div class="feed-item-header">
        <div class="feed-meta">
          <span>İçerik</span>
          <span>•</span>
          <span>${created}</span>
        </div>
        <span class="badge">Post</span>
      </div>
      <div>${item.text}</div>
    `;
    return div;
  }

  function createAiCard(item) {
    const div = document.createElement("div");
    div.className = "feed-item";
    const created = new Date(item.createdAt).toLocaleString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

    div.innerHTML = `
      <div class="feed-item-header">
        <div class="feed-meta">
          <span>InflowAI Beyin</span>
          <span>•</span>
          <span>${created}</span>
        </div>
        <span class="badge">AI</span>
      </div>
      <strong>${item.title}</strong>
      <div>${item.body}</div>
    `;
    return div;
  }

  function createProductCard(prod, index, badgeText = "Ürün") {
    const div = document.createElement("div");
    div.className = "feed-item";
    div.setAttribute("data-product-index", index);

    const created = new Date(prod.createdAt).toLocaleString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

    const priceText =
      typeof prod.price === "number" && !isNaN(prod.price)
        ? prod.price.toFixed(2) + " ₺"
        : "Fiyat belirtilmedi";

    div.innerHTML = `
      <div class="feed-item-header">
        <div class="feed-meta">
          <span>${prod.category || "Ürün"}</span>
          <span>•</span>
          <span>${created}</span>
        </div>
        <span class="badge">${badgeText}</span>
      </div>
      <div style="display:flex; gap:0.7rem;">
        ${
          prod.image
            ? `<div style="min-width:64px; max-width:64px; height:64px; border-radius:12px; overflow:hidden; background:#120830;">
                 <img src="${prod.image}" alt="" style="width:100%; height:100%; object-fit:cover;">
               </div>`
            : ""
        }
        <div style="flex:1;">
          <strong>${prod.name}</strong>
          <div style="font-size:0.82rem; color:#d7c7ff; margin-top:0.15rem;">
            ${prod.desc || "Bu ürün için açıklama henüz yazılmadı."}
          </div>
          <div style="font-size:0.85rem; margin-top:0.3rem;">
            <strong>${priceText}</strong>
          </div>
          <div style="margin-top:0.45rem; display:flex; gap:0.45rem; font-size:0.8rem; color:#ccbfff;">
            <span>❤️ Beğen</span>
            <span>💬 Yorum</span>
            <span>⭐ Favori</span>
          </div>
        </div>
      </div>
      <div style="font-size:0.75rem; margin-top:0.35rem; color:#b8a0ff;">
        Detay görmek için karta tıkla.
      </div>
    `;
    return div;
  }

  function renderFeed(filter = state.currentFeedFilter) {
    if (!homeFeed) return;
    state.currentFeedFilter = filter;
    homeFeed.innerHTML = "";

    const items = [];

    if (filter === "all" || filter === "content") {
      state.posts.forEach((p) => items.push({ type: "post", data: p }));
    }

    if (filter === "all" || filter === "products") {
      state.products.forEach((p, idx) =>
        items.push({ type: "product", data: p, index: idx }),
      );
    }

    if (filter === "all" || filter === "ai") {
      state.aiItems.forEach((a) => items.push({ type: "ai", data: a }));
    }

    // Tarihe göre yeni başa
    items.sort(
      (a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt),
    );

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "feed-item";
      empty.innerHTML =
        "Henüz akışta içerik yok. Ürün ekleyebilir, içerik üretebilir veya paylaşımlar yapabilirsin.";
      homeFeed.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      if (item.type === "post") {
        homeFeed.appendChild(createContentCard(item.data));
      } else if (item.type === "product") {
        homeFeed.appendChild(createProductCard(item.data, item.index, "Ürün"));
      } else if (item.type === "ai") {
        homeFeed.appendChild(createAiCard(item.data));
      }
    });
  }

  /* ------------------------------------------------
   *  PROFİL GÖRÜNÜMÜ
   * ------------------------------------------------ */
  function renderProfile() {
    if (profileName) {
      profileName.textContent = "Misafir Kullanıcı";
    }
    if (profileBio) {
      profileBio.textContent =
        "Giriş yapmadın; şu anda misafir modundasın. Ürettiğin içerikler geçici, ama platformun tüm ücretsiz özelliklerini kullanabilirsin.";
    }

    if (profilePostsEl) profilePostsEl.textContent = state.posts.length;
    if (profileProductsEl) profileProductsEl.textContent = state.products.length;
    if (profileFollowersEl) profileFollowersEl.textContent = 0;
    if (profileFollowingEl) profileFollowingEl.textContent = 0;

    if (profilePostsList) {
      profilePostsList.innerHTML = "";
      state.posts.forEach((p) => {
        const card = document.createElement("div");
        card.className = "feed-item";
        card.innerHTML = `
          <div class="feed-item-header">
            <div class="feed-meta">
              <span>${p.platform || "InflowAI"}</span>
              <span>•</span>
              <span>${new Date(p.createdAt).toLocaleDateString("tr-TR")}</span>
            </div>
            <span class="badge">İçerik</span>
          </div>
          <div>${p.text}</div>
        `;
        profilePostsList.appendChild(card);
      });
      if (!state.posts.length) {
        const empty = document.createElement("div");
        empty.className = "feed-item";
        empty.textContent =
          "Henüz içerik paylaşmadın. Ana sayfadan veya paylaşım ekranından içerik oluşturabilirsin.";
        profilePostsList.appendChild(empty);
      }
    }

    if (profileProductsList) {
      profileProductsList.innerHTML = "";
      state.products.forEach((p, idx) => {
        const card = createProductCard(p, idx, "Mağaza");
        profileProductsList.appendChild(card);
      });
      if (!state.products.length) {
        const empty = document.createElement("div");
        empty.className = "feed-item";
        empty.textContent =
          "Henüz ürün eklemedin. Ürün Ekle sayfasından ilk ürününü ekleyebilirsin.";
        profileProductsList.appendChild(empty);
      }
    }
  }

  /* ------------------------------------------------
   *  ÜRÜN DETAY
   * ------------------------------------------------ */
  function openProductDetail(index) {
    const prod = state.products[index];
    if (!prod || !productDetailBox) return;

    state.currentProduct = index;

    const priceText =
      typeof prod.price === "number" && !isNaN(prod.price)
        ? prod.price.toFixed(2) + " ₺"
        : "Fiyat belirtilmedi";

    productDetailBox.innerHTML = `
      <h2>${prod.name}</h2>
      <p style="font-size:0.85rem; color:#cdbfff; margin-bottom:0.6rem;">
        Kategori: ${prod.category || "Genel"} • Eklenme: ${new Date(
      prod.createdAt,
    ).toLocaleString("tr-TR")}
      </p>
      ${
        prod.image
          ? `<div style="margin-bottom:0.7rem; max-width:260px; border-radius:16px; overflow:hidden; background:#120830;">
               <img src="${prod.image}" alt="" style="width:100%; height:100%; object-fit:cover;">
             </div>`
          : ""
      }
      <p style="font-size:0.9rem; line-height:1.6;">${
        prod.desc || "Bu ürün için açıklama henüz yazılmadı."
      }</p>
      <p style="margin-top:0.6rem; font-size:0.95rem;">
        <strong>Fiyat: ${priceText}</strong>
      </p>
      ${
        prod.video
          ? `<p style="margin-top:0.5rem; font-size:0.83rem;">
               Ürün videosu: <a href="${prod.video}" target="_blank" style="color:#9bf5ff;">Videoyu aç</a>
             </p>`
          : ""
      }
      <div style="margin-top:0.9rem; font-size:0.85rem; color:#d7c7ff;">
        <p>Bu ürün için InflowAI beyni:</p>
        <ul style="padding-left:1.1rem;">
          <li>Satış metni, reels fikri ve TikTok videosu senaryosu üretebilir.</li>
          <li>B2B paneli ile bu ürün için 1 haftalık paylaşım planı oluşturabilir.</li>
          <li>Ürünü ana akışta daha ön planda göstermek için öneriler verebilir.</li>
        </ul>
      </div>
    `;

    switchPage("product-detail");
  }

  if (btnBackFromProduct) {
    btnBackFromProduct.addEventListener("click", () => {
      switchPage("home");
    });
  }

  // Akış ve profil ürün kartlarına tıklayınca detay aç
  if (homeFeed) {
    homeFeed.addEventListener("click", (e) => {
      const card = e.target.closest("[data-product-index]");
      if (!card) return;
      const index = Number(card.getAttribute("data-product-index"));
      openProductDetail(index);
    });
  }

  if (profileProductsList) {
    profileProductsList.addEventListener("click", (e) => {
      const card = e.target.closest("[data-product-index]");
      if (!card) return;
      const index = Number(card.getAttribute("data-product-index"));
      openProductDetail(index);
    });
  }

  /* ------------------------------------------------
   *  NAV BUTONLARI
   * ------------------------------------------------ */
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.getAttribute("data-page");
      if (page) {
        if (page === "profile") renderProfile();
        switchPage(page);
      }
    });
  });

  // Hızlı butonlar
  if (btnQuickCreate) {
    btnQuickCreate.addEventListener("click", () => {
      switchPage("creator");
      if (megaTopic) megaTopic.focus();
      showToast("Mega içerik üretici ekranını açtım. ⚡");
    });
  }

  if (btnQuickProduct) {
    btnQuickProduct.addEventListener("click", () => {
      switchPage("products");
      const nameInput = document.getElementById("prodName");
      if (nameInput) nameInput.focus();
      showToast("Ürün ekleme ekranını açtım. 🛍");
    });
  }

  if (btnLogin) {
    btnLogin.addEventListener("click", () => {
      showToast(
        "Giriş sistemi çok yakında. Şimdilik tüm ücretsiz özellikler misafir olarak açık. 💫",
      );
    });
  }

  /* ------------------------------------------------
   *  FEED TABLARI
   * ------------------------------------------------ */
  feedTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      feedTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const filter = tab.getAttribute("data-feed") || "all";
      renderFeed(filter);
    });
  });

  /* ------------------------------------------------
   *  ÜRÜN EKLEME + AI PAKETİ
   * ------------------------------------------------ */
  function generateProductPackage(prod) {
    const base = prod.name || "ürünün";
    const desc = prod.desc || "ürünün";

    return (
      `🎯 Ürün: ${base}\n` +
      `\n📝 Kısa Açıklama:\n${desc}\n` +
      `\n🛍 Satış Metni:\n` +
      `${base} ile günlük hayatını kolaylaştır. ${desc} arayanlar için güvenilir ve yalın bir çözüm sunar. ` +
      `Bugün dene, farkı sen hisset.\n` +
      `\n🎬 Reels / TikTok Fikri:\n` +
      `1) İlk sahne: Ürün kullanılmadan önceki sorun.\n` +
      `2) Orta sahne: ${base} kullanılırken hızlı geçiş.\n` +
      `3) Son sahne: “İyi ki ${base} almışım” cümlesi ve gülümseyen kullanıcı.\n` +
      `\n📣 Hikâye / Story Duyurusu:\n` +
      `"Bugün ${base} ile tanıştım. Detayları merak edenler DM’den yazsın."`\n` +
      `\n#️⃣ Önerilen Hashtagler:\n` +
      `#inflowai #yeninesilpazar #onlinealisveris #trendurun #gununurunu`
    );
  }

  if (document.getElementById("btnGenerateProductAI")) {
    document
      .getElementById("btnGenerateProductAI")
      .addEventListener("click", () => {
        const name = document.getElementById("prodName").value.trim();
        const desc = document.getElementById("prodDesc").value.trim();
        const prod = { name, desc };
        productAiOutput.textContent = generateProductPackage(prod);
        showToast("Ürünün için AI satış paketi hazırladım. 🚀");
      });
  }

  if (formAddProduct) {
    formAddProduct.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameEl = document.getElementById("prodName");
      const descEl = document.getElementById("prodDesc");
      const priceEl = document.getElementById("prodPrice");
      const catEl = document.getElementById("prodCategory");
      const imgEl = document.getElementById("prodImage");
      const vidEl = document.getElementById("prodVideo");

      const name = nameEl.value.trim();
      if (!name) {
        showToast("Ürün adı zorunlu. 🛍");
        nameEl.focus();
        return;
      }

      const prod = {
        id: genId(),
        name,
        desc: descEl.value.trim(),
        price: priceEl.value ? Number(priceEl.value) : null,
        category: catEl.value || "Diğer",
        image: imgEl.value.trim() || "",
        video: vidEl.value.trim() || "",
        createdAt: new Date().toISOString(),
      };

      state.products.push(prod);
      updateStats();

      productAiOutput.textContent = generateProductPackage(prod);
      showToast("Ürün eklendi ve AI satış paketi hazırlandı. 🛒");
      formAddProduct.reset();
      renderFeed();
    });
  }

  /* ------------------------------------------------
   *  MEGA İÇERİK ÜRETİCİ
   * ------------------------------------------------ */
  function generateMegaPackage(topic, platforms, tone) {
    const t = topic.trim() || "ürünün";
    const toneText =
      tone === "eglencli"
        ? "Eğlenceli ve samimi"
        : tone === "ciddi"
        ? "Ciddi ve güven veren"
        : tone === "sert"
        ? "Sert, net ve racon kesen"
        : "Nötr ve anlaşılır";

    let out = `🎯 Hedef: ${t}\nTarz: ${toneText}\n`;

    if (platforms.includes("tiktok")) {
      out +=
        `\n\n🎥 TikTok / Reels Video Scripti\n` +
        `1) Hook (0–3 sn): Ekranda büyük yazı: “${t} kullananların bilmediği 3 gerçek!”\n` +
        `   Kamera: Yüzüne yakın çekim, hızlı zoom-in.\n` +
        `2) Göster (3–10 sn): Ürünü kullanırken kısa planlar; yakın detay.\n` +
        `3) Kanıt (10–18 sn): Önce/sonra veya küçük metinler: “%92 memnuniyet” gibi.\n` +
        `4) CTA (18–25 sn): “Devamını görmek için profili ziyaret et.”\n` +
        `Önerilen müzik: Ritmi yüksek, enerjik bir fon müziği.\n`;
    }

    if (platforms.includes("instagram")) {
      out +=
        `\n\n📸 Instagram Post & Story Paketi\n` +
        `• Post başlık: "${t} ile hayatını kolaylaştıran 3 küçük dokunuş."\n` +
        `• Açıklama:\n` +
        `  - Sorunu netleştir\n  - Çözüm olarak ${t}’yi anlat\n  - Sonunda “Kaydet & sonra dene” çağrısı yap\n` +
        `• Story fikirleri:\n` +
        `  1) Anket: “${t} tarzı ürünleri denedin mi?” (Evet / Hayır)\n` +
        `  2) Soru kutusu: “Bu ürün senden ne çözmesini istiyorsun?”\n` +
        `• Hashtag paketi: #inflowai #gununicerigi #${t
          .split(" ")
          .join("")} #icerikuretici\n`;
    }

    if (platforms.includes("x")) {
      out +=
        `\n\n🐦 X (Twitter) İçerik Paketi\n` +
        `1) “${t} alırken en çok hangi özelliğe bakıyorsun?”\n` +
        `2) "${t} = sadece ürün değil, aynı zamanda alışkanlık değişimi."\n` +
        `3) “Her gün 1 küçük adım, 1 yıl sonra bambaşka bir sen. ${t} buna dahil olabilir.”\n`;
    }

    if (platforms.includes("youtube")) {
      out +=
        `\n\n📺 YouTube Mini Video Akışı (3–5 dk)\n` +
        `• Açılış (0–30 sn): Kısaca kendini ve ${t}’yi tanıt.\n` +
        `• Bölüm 1: İnsanların yaşadığı problem.\n` +
        `• Bölüm 2: ${t} ile çözüm adımları.\n` +
        `• Bölüm 3: Örnek senaryolar / kullanıcı deneyimi.\n` +
        `• Kapanış: “Bu tarz videoları seviyorsan abone olmayı unutma.”\n`;
    }

    if (platforms.includes("facebook")) {
      out +=
        `\n\n👥 Facebook / Topluluk Gönderisi\n` +
        `“${t} ile ilgili deneyimlerinizi merak ediyorum. İlk kez kullananlara ne tavsiye edersiniz?”\n` +
        `• Grup postu olarak paylaş, yorumları yanıtlayarak topluluğu büyüt.\n`;
    }

    if (platforms.includes("marketplace")) {
      out +=
        `\n\n🛒 Ticaret / Ürün Satış Paketi\n` +
        `• Kısa ürün özeti: ${t} için günlük kullanım ve temel faydaları anlat.\n` +
        `• Satış cümlesi: “Bugün başlayanlar, 1 ay sonra farkı hissedenler.”\n` +
        `• Ürün kartı notu: “Stoklar sınırlı, denemek için doğru zaman.”\n`;
    }

    return out;
  }

  if (btnMegaGenerate && megaOutput) {
    btnMegaGenerate.addEventListener("click", () => {
      if (!megaTopic) return;
      const topic = megaTopic.value;
      if (!topic.trim()) {
        showToast("Önce ne için içerik üretmek istediğini yaz. 💡");
        megaTopic.focus();
        return;
      }

      const checkboxes = document.querySelectorAll(
        '#page-creator .checkbox-grid input[type="checkbox"]',
      );
      const selected = [];
      checkboxes.forEach((c) => c.checked && selected.push(c.value));
      if (!selected.length) {
        showToast("En az bir platform seçmelisin. 📲");
        return;
      }

      const toneSelect = document.getElementById("megaTone");
      const tone = toneSelect ? toneSelect.value : "normal";

      const pkg = generateMegaPackage(topic, selected, tone);
      megaOutput.textContent = pkg;

      // Bir "AI öğesi" olarak akışa ekleyelim
      state.aiItems.push({
        id: genId(),
        title: "Mega içerik paketi hazırlandı",
        body: topic,
        createdAt: new Date().toISOString(),
      });

      updateStats();
      renderFeed();
      showToast("Tüm platformlar için içerik paketin hazır. 🚀");
    });
  }

  /* ------------------------------------------------
   *  B2B PANEL
   * ------------------------------------------------ */
  function generateB2BPlan(sector) {
    let title = "";
    let daily = "";
    let weekly = "";

    switch (sector) {
      case "kuafor":
        title = "Kuaför / Güzellik B2B Planı";
        daily =
          "• Bugün: Öncesi/sonrası saç değişimi Reels + kısa bakım ipucu.\n• Story: “Bugün boşa gitmesin, saçını ne zamandır yenilemedin?” anketi.";
        weekly =
          "• Haftada 3 Reels (dönüşüm)\n• 2 bilgi postu (bakım ipuçları)\n• 1 müşteri yorumu paylaşımı.";
        break;
      case "restoran":
        title = "Restoran / Kafe B2B Planı";
        daily =
          "• Bugün: En çok satan menüden kısa video + ‘Bugün buraya uğrayan var mı?’ sorusu.\n• Story: Günün menüsü + saatli kampanya.";
        weekly =
          "• Haftada 2 menü videosu\n• 2 müşteri yorumu görseli\n• 1 mutfak arkası (backstage) videosu.";
        break;
      case "eticaret":
        title = "E-ticaret Mağazası B2B Planı";
        daily =
          "• Bugün: En çok satan ürünü öne çıkaran Reels / TikTok.\n• Story: “Bu ürünü kullananlar ne diyor?” mini soru kutusu.";
        weekly =
          "• Haftada 3 ürün tanıtım videosu\n• 2 bilgi verici post (kargo, iade, kalite)\n• 1 kampanya duyurusu.";
        break;
      case "egitim":
        title = "Eğitim / Danışmanlık B2B Planı";
        daily =
          "• Bugün: Kısa bir eğitim ipucu + ‘devamı için kaydet’ cümlesi.\n• Story: Mini quiz veya ‘Bunu biliyor muydun?’ sorusu.";
        weekly =
          "• Haftada 3 eğitim içeriği\n• 1 başarı hikayesi\n• 1 canlı yayın duyurusu.";
        break;
      case "emlak":
        title = "Emlak B2B Planı";
        daily =
          "• Bugün: Öne çıkan 1 ilan için video tur.\n• Story: ‘Bugün hangi bölgede ev bakardın?’ anketi.";
        weekly =
          "• Haftada 3 ilan tanıtımı\n• 1 bölge analizi içeriği\n• 1 al-sat süreci hakkında bilgilendirici içerik.";
        break;
      case "saglik":
        title = "Sağlık / Klinik B2B Planı";
        daily =
          "• Bugün: Sık sorulan 1 soruya kısa video cevabı.\n• Story: Randevu hatırlatması + güven veren mesaj.";
        weekly =
          "• Haftada 2 uzman görüşü videosu\n• 2 bilgilendirici grafik\n• 1 hasta deneyimi öyküsü (anonim).";
        break;
      default:
        title = "Genel B2B Planı";
        daily =
          "• Bugün: En çok fayda sağlayan ürün/hizmetini gösteren kısa video.\n• Story: Anket veya soru kutusu ile etkileşim.";
        weekly =
          "• Haftada 3 video\n• 2 bilgi içeriği\n• 1 kampanya / duyuru.";
        break;
    }

    return (
      `${title}\n\n` +
      `📅 Bugün yapılacaklar:\n${daily}\n\n` +
      `📆 Bu hafta yapılacaklar:\n${weekly}\n`
    );
  }

  if (btnB2BPlan && b2bOutput) {
    btnB2BPlan.addEventListener("click", () => {
      const sector = b2bSector ? b2bSector.value : "";
      if (!sector) {
        showToast("Önce sektörünü seç. 🏢");
        return;
      }
      b2bOutput.textContent = generateB2BPlan(sector);
      // B2B planı da bir AI fikri sayılabilir
      state.aiItems.push({
        id: genId(),
        title: "B2B içerik planı oluşturuldu",
        body: `Sektör: ${sector}`,
        createdAt: new Date().toISOString(),
      });
      updateStats();
      renderFeed();
      showToast("Sektörün için içerik ve satış planı hazırladım. 📊");
    });
  }

  /* ------------------------------------------------
   *  PAYLAŞIM OLUŞTUR (POST) + AI AÇIKLAMA
   * ------------------------------------------------ */
  function generatePostPackage(type, platform, desc) {
    const d = desc.trim() || "paylaşımın";
    const p = platform || "InflowAI";

    let base =
      `Platform: ${p}\n` +
      `İçerik özeti: ${d}\n` +
      `\n📝 Önerilen Açıklama:\n`;

    if (p === "tiktok" || p === "instagram") {
      base +=
        `${d} ile ilgili kısa ama akılda kalıcı bir sahne göster. En sonda “Kaydet ve sonra dene” cümlesini ekle.\n`;
    } else if (p === "youtube") {
      base +=
        `Videoda izleyiciye net bir fayda ver. Açıklamada adım adım ne öğrendiğini listele.\n`;
    } else if (p === "x") {
      base += `Mesajı 1–2 cümlede toparla, tartışma açacak bir soru ekle.\n`;
    } else {
      base += `${d} için net, anlaşılır ve samimi bir dil kullan.\n`;
    }

    base += `\n#️⃣ Hashtag Önerileri:\n`;

    base +=
      `#inflowai #gununicerigi #socialcommerce #icerikuretimi #${d
        .split(" ")
        .slice(0, 3)
        .join("")}`;

    return base;
  }

  if (document.getElementById("btnPostAI") && postAiOutput) {
    document
      .getElementById("btnPostAI")
      .addEventListener("click", () => {
        const typeEl = document.getElementById("postType");
        const capEl = document.getElementById("postCaption");
        const platEl = document.getElementById("postPlatform");

        const type = typeEl ? typeEl.value : "image";
        const desc = capEl ? capEl.value : "";
        const platform = platEl ? platEl.value : "inflow";

        if (!desc.trim()) {
          showToast("Önce paylaşımı kısaca anlat. 📝");
          if (capEl) capEl.focus();
          return;
        }

        postAiOutput.textContent = generatePostPackage(
          type,
          platform,
          desc,
        );
        showToast("Paylaşım metnini ve hashtagleri hazırladım. 📲");
      });
  }

  if (formCreatePost) {
    formCreatePost.addEventListener("submit", (e) => {
      e.preventDefault();
      const typeEl = document.getElementById("postType");
      const capEl = document.getElementById("postCaption");
      const platEl = document.getElementById("postPlatform");

      const type = typeEl ? typeEl.value : "image";
      const desc = capEl ? capEl.value.trim() : "";
      const platform = platEl ? platEl.value : "inflow";

      if (!desc) {
        showToast("Önce ne paylaşacağını yaz. 📝");
        if (capEl) capEl.focus();
        return;
      }

      const post = {
        id: genId(),
        type,
        platform,
        text: desc,
        createdAt: new Date().toISOString(),
      };

      state.posts.push(post);
      updateStats();
      renderFeed();
      renderProfile();
      showToast("İçeriğin InflowAI akışına eklendi. 🌌");
      formCreatePost.reset();
    });
  }

  /* ------------------------------------------------
   *  EĞLENCE ALANI
   * ------------------------------------------------ */
  const funReplies = {
    coffee:
      "☕ Kahve Falı\n\nBugün niyetini net tutarsan, küçük bir adım bile büyük bir kapı açabilir. \n\nStory Metni Önerisi:\n“Bugün kahve falım dedi ki: ‘Ertelediğin şeyler, seni bekleyen fırsatlar.’ Katılıyor musun? ☕✨”",
    zodiac:
      "🔮 Burç / Tarot\n\nEnerjin üretim modunda. Küçük ama düzenli adımlar seni 1 yıl sonra bambaşka bir noktaya taşıyacak.\n\nStory Metni Önerisi:\n“Bugünkü enerjim: Üretme ve yenilenme. Senin günün nasıl geçiyor?”",
    advice:
      "💡 Günün Tavsiyesi\n\nMükemmel olması gerekmiyor, bugün bir adım atman yeterli.\n\nStory Metni Önerisi:\n“Bugün mükemmel olmaya değil, ilerlemeye odaklanıyorum. Sen de var mısın? 💜”",
    quiz:
      "😄 Mini Test\n\nSoru:\n“Bu hafta en çok hangisine ihtiyaç duydun?”\nA) Motivasyon\nB) Para\nC) Zaman\nD) İlham\n\nStory Metni Önerisi:\n“Cevabını işaretle, haftalık içeriklerini ona göre planlayalım. 😉”",
  };

  document.querySelectorAll(".fun-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-fun");
      const text =
        funReplies[key] ||
        "Bugün enerjin iyi görünüyor, ufak bir gülümsemeyi hak ediyorsun. 😄";
      funOutput.textContent = text;
      showToast("Eğlence alanından paylaşılabilir bir metin hazırladım. 🎭");
    });
  });

  /* ------------------------------------------------
   *  İLK BAŞLANGIÇ VERİLERİ
   * ------------------------------------------------ */
  // Birkaç örnek AI maddesi
  state.aiItems.push(
    {
      id: genId(),
      title: "Hoş geldin!",
      body: "Bugün en az 1 içerik üret, 1 yıl sonra bile teşekkür edeceğin bir hareket yapmış olursun.",
      createdAt: new Date().toISOString(),
    },
    {
      id: genId(),
      title: "İpucu",
      body: "Her gün 1 kısa video + 1 story paylaşımı, hesabını 3 ayda bambaşka bir seviyeye taşır.",
      createdAt: new Date().toISOString(),
    },
  );

  updateStats();
  renderFeed();
  renderProfile();
});
