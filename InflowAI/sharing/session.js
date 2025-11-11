// ===========================
// InflowAI - Sharing / Session
// Kullanıcı oturumu, son giriş zamanı, aktif kullanıcı sayısı (local simülasyon)
// ===========================

const Session = {
  KEY_LAST_LOGIN: "inflow_last_login",
  KEY_ACTIVE_COUNT: "inflow_active_count",

  markLogin() {
    localStorage.setItem(this.KEY_LAST_LOGIN, new Date().toISOString());
    // aktif kullanıcıyı artır
    const cur = parseInt(localStorage.getItem(this.KEY_ACTIVE_COUNT) || "0", 10) + 1;
    localStorage.setItem(this.KEY_ACTIVE_COUNT, String(cur));
    console.log("[InflowAI Session] Oturum işaretlendi. Aktif:", cur);
  },

  markLogout() {
    const cur = Math.max(parseInt(localStorage.getItem(this.KEY_ACTIVE_COUNT) || "1", 10) - 1, 0);
    localStorage.setItem(this.KEY_ACTIVE_COUNT, String(cur));
    console.log("[InflowAI Session] Oturum kapandı. Aktif:", cur);
  },

  getLastLogin() {
    return localStorage.getItem(this.KEY_LAST_LOGIN);
  },

  getActiveCount() {
    return parseInt(localStorage.getItem(this.KEY_ACTIVE_COUNT) || "0", 10);
  }
};

// Sayfa açıldığında kullanıcı kayıtlıysa oturum işaretle
document.addEventListener("DOMContentLoaded", () => {
  const isRegistered = localStorage.getItem("inflow_registered") === "1";
  if (isRegistered) {
    Session.markLogin();
  }

  // Sağ panelde veya bir yerde göstermek istersen:
  const statusEl = document.querySelector("[data-active-users]");
  if (statusEl) {
    statusEl.textContent = Session.getActiveCount();
  }
});
