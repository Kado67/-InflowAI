// ============================================
// InflowAI – Tek Sayfa (SPA) Arayüz Mantığı
// Tüm temel butonlar & formlar burada çalışır
// Backend gerektirmez, localStorage + hafıza
// ============================================

const InflowUI = (() => {
  // Basit durum
  const state = {
    role: null,
    totalContent: 0,
    totalProducts: 0,
    todayIdeas: 0,
    feedItems: [],
    products: [],
  };

  // Yardımcı – güvenli seçiciler (element yoksa kırma)
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // ---------- EKRAN YÖNETİMİ (SPA) ----------
  function initViews() {
    const buttons = $$('[data-target]');
    const screens = $$('[data-screen]');

    if (!buttons.length || !screens.length) return;

    const show = (id) => {
      screens.forEach((s) => {
        if (s.id === id) {
          s.style.display = "block";
        } else {
          s.style.display = "none";
        }
      });

      buttons.forEach((b) => {
        if (b.dataset.target === id) {
          b.classList.add("active-pill");
        } else {
          b.classList.remove("active-pill");
        }
      });
    };

    // İlk açılış – ana ekran
    show("screen-home");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => show(btn.dataset.target));
    });
  }

  // ---------- ROL / MESLEK SEÇİMİ ----------
  function initRoleBuilder() {
    const select = $("#role-select");
    const btn = $("#btn-build-role");
    const msg = $("#role-message");

    if (!select || !btn || !msg) return;

    btn.addEventListener("click", () => {
      const value = select.value;
      if (!value) {
        msg.textContent = "Lütfen mesleğini / rolünü seç.";
        msg.style.opacity = "1";
        return;
      }

      state.role = value;
      msg.style.opacity = "1";

      const templates = {
        "doktor": "Hasta bilgilendirme videoları, klinik randevu akışı ve muhasebe tek ekranda hazırlandı.",
        "öğretmen": "Ders materyalleri, öğrenci ödev takibi ve veli bilgilendirmeleri için sınıf panelin kuruldu.",
        "e-ticaret": "Ürün katalogları, kampanya içerikleri ve satış raporların InflowAI altında birleşti.",
        "inşaat": "Şantiye raporları, iş güvenliği dokümanları ve teklif içerikleri için yönetim alanın açıldı.",
        "sosyal-medya": "Reels / Shorts senaryoları, post takvimi ve yorum takibi için sosyal panelin aktif edildi.",
      };

      const text =
        templates[value] ||
        "Seçtiğin alana göre e-ticaret, içerik, B2B ve muhasebe modülleri senin için hazırlandı.";

      msg.textContent = text;

      // Platform seni ciddiye alıyor – biraz da fikir üretelim:
      addIdeaToFeed(
        "InflowAI",
        `${select.options[select.selectedIndex].text} için haftalık içerik planı oluşturuldu.`
      );
      incrementIdeas();
    });
  }

  // ---------- İÇERİK ÜRETİCİ ----------
  function initContentProducer() {
    const form = $("#content-form");
    const input = $("#content-topic");
    const out = $("#content-output");
    const quickBtn = $("#btn-quick-content");

    if (quickBtn && form) {
      quickBtn.addEventListener("click", () => {
        // Ana ekrandaki buton içerik ekranına geçirsin
        const contentTab = $('[data-target="screen-content"]');
        if (contentTab) contentTab.click();
        if (input) input.focus();
      });
    }

    if (!form || !input || !out) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const topic = input.value.trim();
      if (!topic) {
        out.textContent = "Önce bir cümle yaz; örnek: 'Moda butik açılışı için kampanya'.";
        return;
      }

      // Basit ama etkili, 4 farklı platform için metin üretiyoruz
      const ideaPack = generateMultiPlatformContent(topic);
      out.innerHTML = ideaPack.html;
      state.totalContent += 4; // 4 platform fikri
      incrementIdeas();
      updateStats();

      addIdeaToFeed("İçerik Üretici", `Yeni fikir seti üretildi: "${topic}"`);
    });
  }

  function generateMultiPlatformContent(topic) {
    const base = topic.replace(/\.$/, "");
    const items = [
      {
        title: "TikTok / Reels Hook",
        text: `“${base}” için 3 saniyede dikkat çeken açılış: Sesli soru sor → ekranda büyük yazı: "${base.toUpperCase()} gerçekten işe yarar mı?"`,
      },
      {
        title: "Instagram Post Başlığı",
        text: `“${base}” temalı karusel için 5 slayt fikri: 1) Sorun, 2) Neden, 3) Çözümün, 4) Örnek sonuç, 5) Aksiyon çağrısı.`,
      },
      {
        title: "X (Twitter) Flood",
        text: `${base} hakkında 5 tweetlik mini flood: giriş, problem, kişisel gözlem, hızlı çözüm, CTA linki.`,
      },
      {
        title: "YouTube Kısa Senaryo",
        text: `15–30 sn'lik kısa video: girişte büyük sorun cümlesi, ortada 2 maddelik çözüm, sonda kanalın için abonelik çağrısı.`,
      },
    ];

    const html =
      `<div class="tiles">` +
      items
        .map(
          (i) => `
        <div class="card">
          <div class="section-chip">${i.title}</div>
          <p style="margin-top:10px;font-size:14px;color:var(--fg2);">
            ${i.text}
          </p>
        </div>
      `
        )
        .join("") +
      `</div>`;

    return { html, items };
  }

  // ---------- ÜRÜN EKLEME ----------
  function initProductForm() {
    const form = $("#product-form");
    const nameEl = $("#product-name");
    const priceEl = $("#product-price");
    const descEl = $("#product-desc");
    const listEl = $("#product-list");

    const quickBtn = $("#btn-quick-product");
    if (quickBtn) {
      quickBtn.addEventListener("click", () => {
        const tab = $('[data-target="screen-commerce"]');
        if (tab) tab.click();
        if (nameEl) nameEl.focus();
      });
    }

    if (!form || !nameEl || !priceEl || !descEl || !listEl) return;

    // Eski ürünleri göster (varsa)
    renderProductList(listEl);

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = nameEl.value.trim();
      const price = priceEl.value.trim();
      const desc = descEl.value.trim();

      if (!name || !price) {
        alert("Ürün adı ve fiyat zorunlu.");
        return;
      }

      const product = {
        id: Date.now(),
        name,
        price,
        desc,
      };

      state.products.unshift(product);
      state.totalProducts += 1;
      updateStats();
      renderProductList(listEl);

      addIdeaToFeed("E-Ticaret", `Yeni ürün yayında: ${name} (${price} ₺)`);

      form.reset();
    });
  }

  function renderProductList(container) {
    if (!container) return;
    if (!state.products.length) {
      container.innerHTML =
        '<p style="font-size:14px;color:var(--fg2);margin:0;">Henüz ürün yok. İlk ürünü eklediğinde burada görünecek.</p>';
      return;
    }

    container.innerHTML = state.products
      .map(
        (p) => `
      <div class="item">
        <div>
          <div style="font-weight:600;">${p.name}</div>
          <div style="font-size:13px;color:var(--fg2);margin-top:2px;">
            ${p.desc || "Açıklama eklenmedi."}
          </div>
        </div>
        <div style="font-weight:700;">${p.price} ₺</div>
      </div>
    `
      )
      .join("");
  }

  // ---------- AKIŞ (FEED) ----------
  function initFeed() {
    const list = $("#feed-list");
    if (!list) return;

    // Varsayılan bir iki örnek ekle
    addIdeaToFeed(
      "InflowAI",
      "Platform her meslek için ayrı panel hazırlamak üzere tasarlandı."
    );
    addIdeaToFeed(
      "InflowAI",
      "İlk içerik ve ürünlerini eklediğinde burada hareketleri göreceksin."
    );
    renderFeed(list);
  }

  function addIdeaToFeed(source, text) {
    state.feedItems.unshift({
      id: Date.now() + Math.random(),
      source,
      text,
      time: new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    const list = $("#feed-list");
    if (list) renderFeed(list);
  }

  function renderFeed(container) {
    if (!container) return;
    if (!state.feedItems.length) {
      container.innerHTML =
        '<p style="font-size:14px;color:var(--fg2);margin:0;">Henüz hareket yok.</p>';
      return;
    }

    container.innerHTML = state.feedItems
      .map(
        (f) => `
      <div class="item">
        <div>
          <div style="font-size:13px;color:var(--fg2);">${f.source}</div>
          <div style="font-size:14px;margin-top:4px;">${f.text}</div>
        </div>
        <div style="font-size:12px;color:var(--fg2);">${f.time}</div>
      </div>
    `
      )
      .join("");
  }

  // ---------- İSTATİSTİKLER ----------
  function initStats() {
    updateStats();
  }

  function incrementIdeas() {
    state.todayIdeas += 1;
    updateStats();
  }

  function updateStats() {
    const c = $("#stat-total-content");
    const p = $("#stat-total-products");
    const i = $("#stat-today-ideas");

    if (c) c.textContent = String(state.totalContent);
    if (p) p.textContent = String(state.totalProducts);
    if (i) i.textContent = String(state.todayIdeas);
  }

  // ---------- EĞLENCE ALANI ----------
  function initFunArea() {
    const coffee = $("#fun-coffee");
    const astro = $("#fun-astro");
    const tip = $("#fun-tip");
    const quiz = "#fun-quiz";

    if (coffee) {
      coffee.addEventListener("click", () => {
        alert("Kahve fotoğrafını yükleyebileceğin AI Fal modülü yakında geliyor. Şimdilik: Bugün sezgilerine güven, ertelediğin işi bitir. ☕");
      });
    }

    if (astro) {
      astro.addEventListener("click", () => {
        alert("Burç & Tarot alanı: İlişkiler ve kariyer için günlük kart çekme özelliği planlandı. ♟️");
      });
    }

    const tipBtn = $("#fun-tip");
    if (tipBtn) {
      tipBtn.addEventListener("click", () => {
        const tips = [
          "Bugün tek bir ürünü seç ve onun için 3 farklı içerik formatı üret.",
          "Profiline mesleğini net yaz; InflowAI önerilerini buna göre genişletecek.",
          "30 dakikalık mikro çalışma bloğu ayarla ve sadece üretime odaklan.",
        ];
        alert("Günün tavsiyesi: " + tips[Math.floor(Math.random() * tips.length)]);
      });
    }

    const quizBtn = $("#fun-quiz");
    if (quizBtn) {
      quizBtn.addEventListener("click", () => {
        alert("Mini testler: 'Hangi içerik tipi sana daha uygun?' gibi quizler yakında aktif olacak. 😊");
      });
    }
  }

  // ---------- MUHASEBE / B2B / SOSYAL ---------
  function initSimpleSections() {
    const accounting = $("#accounting-note");
    if (accounting) {
      accounting.textContent =
        "Zirve / Logo tarzı temel ön muhasebe: gelir-gider, kasa, cari ve fatura özetlerini burada göreceksin. API bağlandığında grafikler otomatik dolar.";
    }

    const b2b = $("#b2b-note");
    if (b2b) {
      b2b.textContent =
        "Burada onay verdiğin iş ortakları senin ürünlerini satabilecek. Komisyon ve raporlar B2B panelinde görünecek.";
    }

    const social = $("#social-note");
    if (social) {
      social.textContent =
        "Takip / mesajlaşma / arama gibi özellikler için altyapı hazırlanıyor. Şimdilik akışta içerik ve ürün hareketlerini görebilirsin.";
    }
  }

  // ---------- PROFİL ----------
  function initProfile() {
    const nameEl = $("#profile-name");
    const badgeEl = $("#profile-badge");

    if (nameEl) {
      nameEl.textContent = "Misafir Kullanıcı";
    }
    if (badgeEl) {
      badgeEl.textContent = "Tüm özellikler şu an misafir modunda açık.";
    }
  }

  // ---------- MÜZİK & BORSA (PLACEHOLDER) ----------
  function initMusicAndStocks() {
    const musicNote = $("#music-note");
    if (musicNote) {
      musicNote.textContent =
        "Çalma listelerin ve odak müzikleri burada. Spotify / YouTube Music entegrasyonu için hazırlık yapılıyor.";
    }

    const stockNote = $("#stock-note");
    if (stockNote) {
      stockNote.textContent =
        "Borsa & kripto takip widget'ı burada görünecek. Gerçek zamanlı fiyatlar için harici API bağlanacak.";
    }
  }

  // ---------- BAŞLAT ----------
  function init() {
    initViews();
    initRoleBuilder();
    initContentProducer();
    initProductForm();
    initFeed();
    initStats();
    initFunArea();
    initSimpleSections();
    initProfile();
    initMusicAndStocks();
  }

  return { init };
})();

// DOM yüklendiğinde başlat
document.addEventListener("DOMContentLoaded", () => {
  InflowUI.init();
});
