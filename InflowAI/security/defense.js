// security/defense.js
// InflowAI - Security - Defense (koruma katmanı)
// Client-side "koruma" sağlar: safe mode, local block flag, interaction throttling.

(function () {
  const DEF = {
    KEY_BLOCK: "inflow_blocked_until",
    KEY_SAFE: "inflow_safe_mode",
    BLOCK_SECONDS: 60 * 5, // geçici blok süresi (5 dakika)
    start() {
      window.addEventListener("inflow:security:detected", (e) => {
        this.handleDetection(e.detail);
      });
      // periyodik kontrol (ör. blocked süresinin dolması)
      setInterval(() => {
        const blockedUntil = parseInt(localStorage.getItem(this.KEY_BLOCK) || "0", 10);
        if (blockedUntil && Date.now() > blockedUntil) {
          localStorage.removeItem(this.KEY_BLOCK);
          console.log("[InflowAI Defense] Geçici blok kaldırıldı.");
          window.dispatchEvent(new CustomEvent("inflow:security:unblocked"));
        }
      }, 30000);
      // tüm istekleri incelemek için global fetch wrap (hafif)
      this.hookFetch();
      console.log("[InflowAI Defense] Başlatıldı.");
    },
    handleDetection(detail) {
      // simple rules: hata tipi veya şüpheli input -> safe mode
      const name = detail.name || "";
      console.warn("[InflowAI Defense] Algılama alındı:", name);
      // notify alert module
      this.notifyAlert("detected", detail);

      if (name === "rapid.clicks" || name === "suspicious.input" || name === "console.spike") {
        this.enableSafeMode(detail);
      } else if (name === "window.error" || name === "unhandledrejection") {
        // kritik hata: kısa süreli blok
        this.tempBlock(this.BLOCK_SECONDS);
      } else {
        // default: küçük uyarı
        this.logLowSeverity(detail);
      }
    },
    enableSafeMode(detail) {
      localStorage.setItem(this.KEY_SAFE, "1");
      console.warn("[InflowAI Defense] Safe Mode aktif edildi.");
      this.notifyAlert("safe_mode_on", detail);
      window.dispatchEvent(new CustomEvent("inflow:security:safe_on", { detail }));
      // örnek: kullanıcıyı yavaşlat (butonları disable et)
      this.applyUiThrottle();
    },
    disableSafeMode() {
      localStorage.removeItem(this.KEY_SAFE);
      console.log("[InflowAI Defense] Safe Mode kapandı.");
      this.notifyAlert("safe_mode_off", {});
      window.dispatchEvent(new CustomEvent("inflow:security:safe_off"));
      this.removeUiThrottle();
    },
    tempBlock(seconds) {
      const until = Date.now() + (seconds * 1000);
      localStorage.setItem(this.KEY_BLOCK, String(until));
      console.error("[InflowAI Defense] Geçici blok uygulandı, saniye:", seconds);
      this.notifyAlert("temp_block", { until });
      window.dispatchEvent(new CustomEvent("inflow:security:blocked", { detail: { until } }));
    },
    applyUiThrottle() {
      // örnek: tüm .primary-btn sınıfına disable ekle (görsel)
      const els = document.querySelectorAll("button, a, input");
      els.forEach(el => {
        el.dataset._inflow_disabled = "1";
        el.style.pointerEvents = "none";
        el.style.opacity = "0.6";
      });
    },
    removeUiThrottle() {
      const els = document.querySelectorAll("[data-_inflow_disabled='1']");
      els.forEach(el => {
        el.style.pointerEvents = "";
        el.style.opacity = "";
        delete el.dataset._inflow_disabled;
      });
    },
    hookFetch() {
      if (!window.fetch) return;
      const origFetch = window.fetch.bind(window);
      window.fetch = function (...args) {
        const blockedUntil = parseInt(localStorage.getItem(DEF.KEY_BLOCK) || "0", 10);
        if (blockedUntil && Date.now() < blockedUntil) {
          // bloke cevap simülasyonu: promise rejection
          return Promise.reject(new Error("InflowAI: temporary blocked by client-side defense"));
        }
        return origFetch(...args);
      };
    },
    notifyAlert(type, detail) {
      // dispatch for alert module
      window.dispatchEvent(new CustomEvent("inflow:security:alert", { detail: { type, detail, time: new Date().toISOString() } }));
    },
    logLowSeverity(detail) {
      // küçük log, ileriye dönük
      console.log("[InflowAI Defense] Low severity event:", detail);
    }
  };

  document.addEventListener("DOMContentLoaded", () => DEF.start());
  window.InflowDefense = DEF;
})();
