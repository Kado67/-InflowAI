// control/toggles.js
// Yönetici sonradan premium, kurumsal, b2b açabilsin diye basit fonksiyonlar.

const InflowToggles = {
  enablePackage(name) {
    if (window.inflowPackages && window.inflowPackages[name]) {
      window.inflowPackages[name].active = true;
      localStorage.setItem("inflow_pkg_" + name, "1");
      console.log("[InflowAI Control] Paket açıldı:", name);
    } else {
      console.warn("[InflowAI Control] Paket bulunamadı:", name);
    }
  },
  disablePackage(name) {
    if (window.inflowPackages && window.inflowPackages[name]) {
      window.inflowPackages[name].active = false;
      localStorage.removeItem("inflow_pkg_" + name);
      console.log("[InflowAI Control] Paket kapatıldı:", name);
    }
  },
  enableAds() {
    if (window.servicesConfig && window.servicesConfig.ads) {
      window.servicesConfig.ads.enabled = true;
      console.log("[InflowAI Control] Reklam alanı açıldı.");
    }
  },
  disableAds() {
    if (window.servicesConfig && window.servicesConfig.ads) {
      window.servicesConfig.ads.enabled = false;
      console.log("[InflowAI Control] Reklam alanı kapatıldı.");
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("[InflowAI Control] Toggle modülü yüklendi.");
});
