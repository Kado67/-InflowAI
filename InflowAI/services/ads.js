// ===========================
// InflowAI Katman 3: ADS SERVICE
// ===========================
// Reklam alanlarının yönetimi (AdSense veya özel sponsor slotları)
// Config dosyasındaki ayarları kullanır.

if (typeof servicesConfig !== "undefined") {
  const { ads } = servicesConfig;

  if (ads.enabled) {
    console.log(`[InflowAI Ads] ${ads.slotCount} reklam alanı aktif.`);

    ads.slots.forEach((slot) => {
      if (slot.active && slot.code) {
        const container = document.createElement("div");
        container.className = "ad-slot";
        container.innerHTML = slot.code;
        document.body.appendChild(container);
      }
    });
  } else {
    console.log("[InflowAI Ads] Reklam sistemi şu an kapalı.");
  }
} else {
  console.error("[InflowAI Ads] servicesConfig bulunamadı!");
}
