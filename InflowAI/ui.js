// ========================================
// InflowAI - UI Sahne Motoru (Frontend)
// Tatlı Robot + Polat-AI sahnesi
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  const cuteDialog = document.getElementById("cuteDialog");
  const polatDialog = document.getElementById("polatDialog");
  const cuteRobot = document.getElementById("cuteRobot");
  const polatRobot = document.getElementById("polatRobot");
  const input = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");

  // Güvenlik kontrolü – HTML elemanları gerçekten var mı
  if (!cuteDialog || !polatDialog || !cuteRobot || !polatRobot || !input || !sendBtn) {
    console.warn("InflowAI UI: Bazı sahne elemanları bulunamadı.");
    return;
  }

  // Küçük animasyon efekti (zıplama)
  function bounce(el) {
    if (!el) return;
    el.style.transition = "transform 0.25s ease";
    el.style.transform = "translateY(-10px)";
    setTimeout(() => {
      el.style.transform = "translateY(0)";
    }, 250);
  }

  // Diyalog değiştirme yardımcıları
  function setCute(text) {
    cuteDialog.textContent = text;
    bounce(cuteRobot);
  }

  function setPolat(text) {
    polatDialog.textContent = text;
    bounce(polatRobot);
  }

  // Açılış şovu
  function introShow() {
    setCute("Hoş geldiiin 😄💙✨");
    setPolat("Hoş geldin kardeşim. Biz buradayız.");

    setTimeout(() => {
      setCute("Bugün senin için sihir, dans ve fikir var. 🔮");
      setPolat("Sorunu söyle, raconu ben yazarım.");
    }, 4000);
  }

  // Otomatik mini şovlar (ziyaretçi hiçbir şey yapmasa bile)
  const autoShows = [
    () => {
      setCute("Bak şimdi minik bir dans yapıyorum! 💃✨");
      setPolat("Sen dans et, ben raconu düşünürüm.");
    },
    () => {
      setCute("Kalp yolladım sana 💙");
      setPolat("Kalp güzeldir, adamlık daha güzel.");
    },
    () => {
      setCute("Bugün bir tane bile içerik üretmeden gitme. 😄");
      setPolat("Her gün bir adım, yüz günde yeni bir hayat.");
    },
    () => {
      setCute("İstersen eğlence alanına da uğrayabiliriz. 🎭");
      setPolat("Hem iş var hem keyif, karar senin kardeşim.");
    },
    () => {
      setCute("Bir soru yaz, birlikte çözelim. 🤖");
      setPolat("Çözülmeyecek sorun yoktur, eksik racon vardır.");
    }
  ];

  function runRandomShow() {
    const fn = autoShows[Math.floor(Math.random() * autoShows.length)];
    fn();
  }

  // Ziyaretçi mesajını işleme
  function handleUserMessage() {
    const text = (input.value || "").trim();

    if (!text) {
      setCute("Bir şey yaz, sana özel cevap vereyim 😄");
      setPolat("Boş durma kardeşim, bir cümle bile yeter.");
      return;
    }

    // Ziyaretçi yazdıktan sonra tepki
    setCute(`Bunu duydum: "${text}" ✨`);
    setPolat("Güzel soru. Şimdi bunun için en iyi yolu düşünelim.");

    // Mesajı temizle
    input.value = "";

    // Küçük ek diyalog (isteğe göre genişler)
    setTimeout(() => {
      setCute("İstersen bir içerik ya da fikir üretebiliriz.");
      setPolat("İş, eğlence, strateji… ne lazımsa buradayız.");
    }, 3000);
  }

  // Buton ve Enter tuşu olayı
  sendBtn.addEventListener("click", handleUserMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleUserMessage();
    }
  });

  // Başlangıçta intro şov
  introShow();

  // Her 15 saniyede bir otomatik mini şov
  setInterval(runRandomShow, 15000);
});
