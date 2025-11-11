// security/alert.js
// InflowAI - Security - Alert (log & notify)
// Kısa süreli local kayıt, console çıktısı ve gelecekteki server push noktası.

(function () {
  const ALERT = {
    KEY_LOG: "inflow_alerts",
    maxStored: 100,
    start() {
      window.addEventListener("inflow:security:alert", (e) => {
        this.handle(e.detail);
      });
      window.addEventListener("inflow:security:detected", (e) => {
        // ekstra: direkt detect olaylarını da kaydet
        this.handle({ name: e.detail.name || "detect", payload: e.detail.payload || e.detail });
      });
      console.log("[InflowAI Alert] Alert modülü başlatıldı.");
    },
    handle(event) {
      const record = {
        id: Math.random().toString(36).slice(2, 9),
        time: event.time || new Date().toISOString(),
        type: event.type || event.name || "alert",
        detail: event.detail || (event.payload || event)
      };
      this.push(record);
      // developer için görünür bildirim
      console.warn("[InflowAI Alert] Yeni kayıt:", record.type, record.detail);
      // ops panel veya remote server entegrasyonu buraya eklenir
      // örnek: sendToServer(record) - (şimdilik local)
    },
    push(rec) {
      const arr = JSON.parse(localStorage.getItem(this.KEY_LOG) || "[]");
      arr.unshift(rec);
      while (arr.length > this.maxStored) arr.pop();
      localStorage.setItem(this.KEY_LOG, JSON.stringify(arr));
    },
    getAll() {
      return JSON.parse(localStorage.getItem(this.KEY_LOG) || "[]");
    },
    clear() {
      localStorage.removeItem(this.KEY_LOG);
      console.log("[InflowAI Alert] Loglar temizlendi.");
    }
  };

  document.addEventListener("DOMContentLoaded", () => ALERT.start());
  window.InflowAlert = ALERT;
})();
