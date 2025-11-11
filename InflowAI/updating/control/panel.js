// control/panel.js
// Tüm katmanların durumunu okuyup küçük bir kontrol konsolu hazırlıyor.
// Şimdilik console tabanlı, sonra UI'ye bağlarız.

const InflowControl = {
  getState() {
    return {
      version: (window.InflowVersion && window.InflowVersion.get && window.InflowVersion.get()) || null,
      services: window.servicesConfig || null,
      packages: window.inflowPackages || null,
      features: window.inflowFeatures || null
    };
  },
  print() {
    console.log("----- InflowAI Kontrol Merkezi -----");
    console.log(this.getState());
    console.log("------------------------------------");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("[InflowAI Control] Panel yüklendi. Durumu görmek için InflowControl.print() yaz.");
});
