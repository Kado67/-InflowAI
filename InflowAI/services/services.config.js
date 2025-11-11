// ===========================
// InflowAI Katman 3: SERVICES CONFIG
// ===========================
// Tüm servislerin temel ayarları burada tutulur.
// Kontrol Merkezi geldiğinde bu dosya dinamik olarak güncellenecek.

const servicesConfig = {
  version: "v1.0.0",
  updated: new Date().toISOString(),

  // Servislerin aktif/pasif durumu
  ads: {
    enabled: false,        // Reklam alanı kapalı (sonra aktif edilecek)
    provider: "google-adsense",
    slotCount: 2,
    slots: [
      { id: "slot-1", code: "", active: false },
      { id: "slot-2", code: "", active: false }
    ]
  },

  paytr: {
    enabled: false,
    merchantId: "",
    merchantKey: "",
    merchantSalt: ""
  },

  modules: {
    aiWriter: false,       // Yapay zekâ içerik üretimi
    aiImage: false,        // Görsel üretimi
    aiFun: false           // Eğlence modülü (fal/test vb.)
  }
};

console.log("[InflowAI] Services config yüklendi ✅");
