// -------------------------------
// InflowAI UI Beyni
// -------------------------------

// 3 HAK SİSTEMİ
let guestRights = 3;

// Rastgele avatar cümleleri
const avatarLines = [
  "Hoş geldin! Bugün senin için çok şey hazırladım 💜",
  "Bir şey yazmana da gerek yok, seni eğlendirebilirim 😄",
  "Hazırsan içerik üretmeye başlayalım ⚡",
  "Kahve falı ister misin? ☕✨",
  "Bugün enerjin çok güzel görünüyor 🌟",
  "İstersen B2B panelini açayım, tamamen ücretsiz 🏢"
];

// Avatar balonunu güncelle
function updateAvatar(text) {
  document.getElementById("avatarBubble").innerText = text;
}

// Avatar rastgele konuşma döngüsü
setInterval(() => {
  const random = avatarLines[Math.floor(Math.random() * avatarLines.length)];
  updateAvatar(random);
}, 5000);

// -------------------------------
// Hak kontrol sistemi
// -------------------------------
function useRight() {
  if (guestRights <= 0) {
    updateAvatar("Kurban, 3 hakkın bitti. Devam etmek için kayıt olmalısın ❤️");
    alert("3 hakkın bitti. Devam etmek için kayıt ol.");
    return false;
  }
  guestRights--;
  return true;
}

// -------------------------------
// Canlı içerik üretici
// -------------------------------
document.getElementById("sendBtn").addEventListener("click", () => {
  const text = document.getElementById("userInput").value.trim();

  if (!text) {
    updateAvatar("Ne üreteyim tatlım? Bir şey yazman yeterli 💜");
    return;
  }

  if (!useRight()) return;

  updateAvatar(`Senin için içerik üretiyorum… ⚡`);

  setTimeout(() => {
    updateAvatar(`Hazır! İşte yeni içeriğin: "${text}" için güçlü bir fikir 💡`);
    alert("İçerik üretildi: Harika bir fikir oluşturuldu!");
  }, 800);
});

// -------------------------------
// İçerik üret — kısa yol
// -------------------------------
document.getElementById("btnProduce").addEventListener("click", () => {
  if (!useRight()) return;

  updateAvatar("Tamamdır kurban, içerik üretme modunu açıyorum ⚡");
  scrollToSection("userInput");
});

// -------------------------------
// Platform bana ne yapıyor?
// -------------------------------
document.getElementById("btnExplain").addEventListener("click", () => {
  updateAvatar("Şu an seni eğlendiriyor, içerik üretiyor ve B2B hizmeti veriyorum 💜");
  scrollToSection("sectionFeatures");
});

// -------------------------------
// Eğlence butonları
// -------------------------------
document.querySelector("[data-target='fun']").addEventListener("click", () => {
  if (!useRight()) return;
  updateAvatar("Eğlence alanını açtım! Kahve falı ister misin? ☕✨");
  scrollToSection("sectionFun");
});

// -------------------------------
// İçerik üretici kartı
// -------------------------------
document.querySelector("[data-target='content']").addEventListener("click", () => {
  if (!useRight()) return;
  updateAvatar("Hadi bir içerik üretelim ⚡");
  scrollToSection("userInput");
});

// -------------------------------
// B2B Paneli
// -------------------------------
document.querySelector("[data-target='b2b']").addEventListener("click", () => {
  if (!useRight()) return;
  updateAvatar("B2B panelini açtım! Şirket fikri üretelim 🏢✨");
  alert("B2B Paneli: İşletmen için içerik planı, takvimi ve öneriler üretilecek.");
});

// -------------------------------
// Login butonu
// -------------------------------
document.getElementById("btnLogin").addEventListener("click", () => {
  alert("Giriş bölümü yakında aktif olacak. Şu an ücretsiz misafir modundasın.");
});

// -------------------------------
// KAYDIRMA FONKSİYONU
// -------------------------------
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({
    behavior: "smooth"
  });
}
