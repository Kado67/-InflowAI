// ================================================
// InflowAI - GROWTH ENGINE
// Platformun büyüme, akış ve ziyaretçi davranış
// yönetiminden sorumlu olan katman
// ================================================

module.exports = {
  
  // Ziyaretçinin platformla etkileşim seviyesini ölçer
  analyzeVisitor(inputText) {
    if (!inputText) {
      return {
        level: "idle",
        message: "Ziyaretçi şu anda sadece izliyor.",
      };
    }

    const length = inputText.length;

    if (length < 5) {
      return {
        level: "low",
        message: "Ziyaretçi küçük bir giriş yaptı.",
      };
    }

    if (length < 50) {
      return {
        level: "medium",
        message: "Ziyaretçi aktif olarak etkileşimde.",
      };
    }

    return {
      level: "high",
      message: "Ziyaretçi platformu güçlü şekilde kullanıyor!",
    };
  },

  // Otomatik akış – platform boş kalmasın diye tetikler
  generateAutoShow() {
    const shows = [
      "Tatlı Robot ufak bir dans ediyor 💃✨",
      "Polat-AI, 'Burada racon bellidir.' diyor 😎🔥",
      "Tatlı Robot neon bir kalp gönderiyor 💙",
      "Polat-AI sahneye ağır adımlarla giriyor.",
      "Tatlı Robot minik bir sihir gösterisi yapıyor 🔮✨",
      "Polat-AI tatlı robota 'Yavaş oğlum.' diyor.",
    ];

    const random = Math.floor(Math.random() * shows.length);
    return shows[random];
  },

  // Trend ve büyüme tahmini – API tarafından kullanılır
  predictGrowth(usageCount) {
    if (usageCount < 10) {
      return "Yavaş ama istikrarlı büyüme.";
    }
    if (usageCount < 100) {
      return "Platform hızla büyüyor!";
    }
    return "InflowAI büyümede rekor kırıyor! 🚀🔥";
  },

  // Kullanıcının içerik tüketim davranışı
  analyzeIntent(message) {
    if (!message) return "unknown";

    const msg = message.toLowerCase();

    if (msg.includes("içerik") || msg.includes("yazı") || msg.includes("blog"))
      return "content";

    if (msg.includes("video") || msg.includes("reels"))
      return "video";

    if (msg.includes("b2b") || msg.includes("satış"))
      return "b2b";

    if (msg.includes("eğlence") || msg.includes("fal") || msg.includes("burç"))
      return "fun";

    return "general";
  },

};
