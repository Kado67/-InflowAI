// ===========================
// InflowAI Katman 2: GROWTH (BÜYÜME)
// ===========================
// Bu dosya paket yapısını, özellik bayraklarını ve basit ziyaretçi analizini yönetir.
// Core katmanına dokunmaz, sadece üzerine veri ve sistem altyapısı ekler.

// 1️⃣ Paket tanımları
const inflowPackages = {
  free: {
    id: "free",
    title: "Ücretsiz",
    active: true,
    limits: {
      guestTries: 3,
      registered: "unlimited"
    }
  },
  pro: {
    id: "pro",
    title: "Pro",
    active: false,
    limits: {
      monthly: 1000
    }
  },
  enterprise: {
    id: "enterprise",
    title: "Kurumsal",
    active: false
  },
  b2b: {
    id: "b2b",
    title: "B2B",
    active: false
  }
};

// 2️⃣ Özellik (feature flag) sistemi
const inflowFeatures = {
  aiContent: true,        // Yapay zeka içerik üretimi aktif
  aiFun: false,           // Eğlence alanı sonraki katmanda
  adsenseSlots: false,    // Services katmanında aktif edilecek
  paytr: false,           // Services katmanında aktif edilecek
  moderation: false,      // İçerik denetimi (ileride)
  analyticsPanel: true    // Basit istatistik toplama aktif
};

// 3️⃣ Basit ziyaretçi analiz sistemi
(function initAnalytics() {
  const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
  const totalVisits = parseInt(localStorage.getItem("inflow_total_visits") || "0", 10) + 1;
  localStorage.setItem("inflow_total_visits", String(totalVisits));

  // Günlük istatistik
  const dailyRaw = localStorage.getItem("inflow_daily") || "{}";
  let daily = {};
  try {
    daily = JSON.parse(dailyRaw);
  } catch {
    daily = {};
  }
  const todayCount = (daily[todayKey] || 0) + 1;
  daily[todayKey] = todayCount;
  localStorage.setItem("inflow_daily", JSON.stringify(daily));

  // Son ziyaret zamanı
  localStorage.setItem("inflow_last_visit", new Date().toISOString());

  // Eğer uptime alanı varsa istatistik bilgisi ekle
  const uptimeEl = document.getElementById("uptimeVal");
  if (uptimeEl) {
    uptimeEl.title = `Toplam ziyaret: ${totalVisits} • Bugün: ${todayCount}`;
  }

  console.log(`[InflowAI Growth] Bugünkü ziyaret sayısı: ${todayCount}`);
})();

// 4️⃣ Paketleri UI’ya yansıtmak
(function applyPackagesToUI() {
  // Admin tarafından kaydedilmiş durumları oku (ileride kontrol merkezinden değişecek)
  const savedPro = localStorage.getItem("inflow_pkg_pro") === "1";
  const savedEnt = localStorage.getItem("inflow_pkg_enterprise") === "1";
  const savedB2B = localStorage.getItem("inflow_pkg_b2b") === "1";

  if (savedPro) inflowPackages.pro.active = true;
  if (savedEnt) inflowPackages.enterprise.active = true;
  if (savedB2B) inflowPackages.b2b.active = true;

  const side = document.querySelector(".side-panel");
  if (!side) return;

  // Menüdeki itemleri güncelle
  const items = side.querySelectorAll(".nav-item");
  items.forEach((btn) => {
    const text = btn.textContent.toLowerCase();
    if (text.includes("pro")) {
      btn.classList.toggle("disabled", !inflowPackages.pro.active);
    }
    if (text.includes("kurumsal")) {
      btn.classList.toggle("disabled", !inflowPackages.enterprise.active);
    }
    if (text.includes("b2b")) {
      btn.classList.toggle("disabled", !inflowPackages.b2b.active);
    }
  });
})();

// 5️⃣ Sonuç çıktısı (test)
console.log("[InflowAI] Growth katmanı yüklendi ✅");
