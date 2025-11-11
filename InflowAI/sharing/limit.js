// ===========================
// InflowAI - Sharing / Limit
// Misafir 3 hak, kayıtlı sınırsız
// app.js ile aynı anahtarları kullanıyoruz ki çakışma olmasın.
// ===========================

const INFLOW_GUEST_USED_KEY = "inflow_guest_used";
const INFLOW_MAX_GUEST_TRIES = 3;

const Limit = {
  getUsed() {
    return parseInt(localStorage.getItem(INFLOW_GUEST_USED_KEY) || "0", 10);
  },
  setUsed(val) {
    localStorage.setItem(INFLOW_GUEST_USED_KEY, String(val));
  },
  getLeft() {
    const used = this.getUsed();
    return Math.max(INFLOW_MAX_GUEST_TRIES - used, 0);
  },
  useOne() {
    const used = this.getUsed();
    if (used < INFLOW_MAX_GUEST_TRIES) {
      this.setUsed(used + 1);
      console.log(`[InflowAI Limit] Hak kullanıldı (${used + 1}/${INFLOW_MAX_GUEST_TRIES})`);
      return true;
    } else {
      console.log("[InflowAI Limit] Misafir hakları bitti.");
      return false;
    }
  },
  reset() {
    this.setUsed(0);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Ekrandaki "Kalan hak" alanını güncelle
  const tryInfo = document.getElementById("tryInfo");
  if (!tryInfo) return;

  const isRegistered = localStorage.getItem("inflow_registered") === "1";
  if (isRegistered) {
    tryInfo.textContent = "Kayıtlı: sınırsız kullanım";
    tryInfo.style.color = "#b5ffff";
  } else {
    tryInfo.textContent = "Kalan hak: " + Limit.getLeft();
  }
});
