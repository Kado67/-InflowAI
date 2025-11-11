// updating/autofix.js
// Küçük hataları kendisi düzeltmeye çalışan katman.
// Örneğin eksik script yüklendiyse uyarı verir, bazı global isim çakışmalarını düzeltir.

(function () {
  const AutoFix = {
    start() {
      console.log("[InflowAI Updating] AutoFix aktif.");
      this.fixDuplicateScripts();
      this.ensureGlobals();
    },
    fixDuplicateScripts() {
      // aynı src'li script 2 defa eklenmişse 2.sini devre dışı bırak
      const seen = new Set();
      document.querySelectorAll("script[src]").forEach((sc) => {
        const src = sc.getAttribute("src");
        if (seen.has(src)) {
          // devre dışı
          sc.parentNode.removeChild(sc);
          console.warn("[InflowAI AutoFix] Çift script kaldırıldı:", src);
        } else {
          seen.add(src);
        }
      });
    },
    ensureGlobals() {
      // bazı katmanlar yüklenmemişse boş objeler oluştur
      if (typeof window.servicesConfig === "undefined") {
        window.servicesConfig = { ads: { enabled: false }, paytr: { enabled: false }, modules: {} };
        console.warn("[InflowAI AutoFix] servicesConfig eksikti, oluşturuldu.");
      }
    }
  };

  document.addEventListener("DOMContentLoaded", () => AutoFix.start());
  window.InflowAutoFix = AutoFix;
})();
