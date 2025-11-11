// ===========================
// InflowAI - Sharing / Language
// Tarayıcı diline göre TR/EN ayarı
// Şimdilik sadece console'a yazar, ilerde UI'da kullanacağız.
// ===========================

const Language = {
  current: "tr",

  detect() {
    const navLang = navigator.language || navigator.userLanguage || "tr";
    if (navLang.toLowerCase().startsWith("tr")) {
      this.current = "tr";
    } else {
      this.current = "en";
    }
    console.log("[InflowAI Language] Algılanan dil:", this.current);
    return this.current;
  },

  set(lang) {
    this.current = lang;
    console.log("[InflowAI Language] Dil manuel ayarlandı:", lang);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Language.detect();

  // Sayfada .lang-pill varsa onu güncelle
  const pill = document.querySelector(".lang-pill");
  if (pill) {
    pill.textContent = Language.current.toUpperCase();
  }
});
