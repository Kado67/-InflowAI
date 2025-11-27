// InflowAI Ön Yüz Mantığı
// Tüm ücretsiz özellikler sınırsız; 3 hak SINIRI YOK.

document.addEventListener("DOMContentLoaded", () => {
  const avatarBubble = document.getElementById("avatarBubble");
  const toast = document.getElementById("toast");
  const userInput = document.getElementById("userInput");
  const outputBox = document.getElementById("outputBox");
  const feed = document.getElementById("feed");

  /* -----------------------------
     1. Avatar Konuşma Döngüsü
  --------------------------------*/
  const avatarMessages = [
    "Hoş geldin, bugün ne üretmek istiyorsun? 💜",
    "Tek cümle yaz, sana tam içerik paketi hazırlayayım. ⚡",
    "İster eğlen, ister büyü – ikisini de beraber yapalım. ✨",
    "Kafanda ne varsa yaz, sonraki adımı ben düşünürüm. 🤝",
    "Ziyaretçilerini şaşırtmak için birkaç fikrim var. Hazır mısın? 🚀",
  ];
  let msgIndex = 0;

  setInterval(() => {
    msgIndex = (msgIndex + 1) % avatarMessages.length;
    avatarBubble.textContent = avatarMessages[msgIndex];
  }, 8000);

  /* -----------------------------
     2. Yardımcı Fonksiyonlar
  --------------------------------*/
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* -----------------------------
     3. Giriş Butonu
  --------------------------------*/
  const btnLogin = document.getElementById("btnLogin");
  if (btnLogin) {
    btnLogin.addEventListener("click", () => {
      showToast(
        "Giriş ve kayıt sistemi çok yakında. Şimdilik tüm ücretsiz özellikler misafir olarak açık. 💫"
      );
    });
  }

  /* -----------------------------
     4. Hero Butonları
  --------------------------------*/
  const btnProduce = document.getElementById("btnProduce");
  const btnExplain = document.getElementById("btnExplain");
  const sendBtn = document.getElementById("sendBtn");

  function handleProduceClick() {
    scrollToSection("sectionInput");
    if (userInput) {
      userInput.focus();
    }
  }

  if (btnProduce) btnProduce.addEventListener("click", handleProduceClick);

  if (btnExplain) {
    btnExplain.addEventListener("click", () => {
      scrollToSection("sectionFeatures");
      showToast("Aşağıda şu anda açık olan tüm özellikleri gösteriyorum. 👇");
    });
  }

  /* -----------------------------
     5. Kartlardaki küçük butonlar
  --------------------------------*/
  document.querySelectorAll("[data-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      if (target === "produce") {
        handleProduceClick();
      } else if (target === "fun") {
        scrollToSection("sectionFun");
      } else if (target === "b2b") {
        scrollToSection("sectionB2B");
        showToast("B2B panelinde işletmeler için hazır planları açtım. 📊");
      }
    });
  });

  /* -----------------------------
     6. Eğlence Alanı Tıklamaları
  --------------------------------*/
  const funReplies = {
    coffee:
      "☕ Kahve Falı\n\nBugün içinden geçen ilk fikre güven. Küçük bir içerik bile büyük bir kapı açabilir.",
    zodiac:
      "🔮 Burç / Tarot\n\nEnerjin tam üretme modunda. Yeni bir seri başlatmak için harika bir gün.",
    advice:
      "💡 Günün Tavsiyesi\n\nMükemmel olsun diye bekleme. ‘Yayınlanmış iyi içerik’, ‘bekleyen mükemmel içerikten’ her zaman daha iyidir.",
    quiz:
      "😄 Mini Test\n\nTakipçilerine bugün şu soruyu sor:\n“Bu yıl kendin için yaptığın en iyi şey neydi?”",
  };

  document.querySelectorAll(".fun-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-fun");
      const text = funReplies[key] || "Bugün enerjin çok iyi görünüyor. 😄";
      outputBox.textContent = text;
      scrollToSection("sectionResult");
      showToast("Eğlence alanından bir içerik fikri hazırladım. 🎭");
    });
  });

  /* -----------------------------
     7. İçerik Üretimi (Basit AI Simülasyonu)
  --------------------------------*/
  function generateContent(topic) {
    const trimmed = topic.trim();
    const base = trimmed || "markan";

    const ideas = [
      `🎬 Reels Fikri:
- Açılışta ekrana şu metin gelsin: “${base} için 3 saniyede güven ver.”
- İlk sahne: Önce / Sonra karşılaştırması
- Son sahne: “Devamı için takip et” yazısı ve logon.`,

      `📝 Post Açıklaması:
"${base}" hakkında insanların en sık sorduğu soruyu alıp, cevabını 3 maddede anlat.
1) Sorunu net söyle
2) Senin çözümünü kısa anlat
3) Sonunda “Kaydet ve ihtiyacın olunca dön” cümlesini ekle.`,

      `📌 Hikâye / Story Fikri:
- 3 story'lik mini seri yap.
1) “Bugün sana küçük ama etkili bir ipucu vereceğim.”
2) İpucunu tek cümle ile anlat.
3) “Bu tarz ipuçlarını kaçırmamak için hikâyeleri açık tut.”`,

      `📈 Büyüme Önerisi:
- Haftada en az 3 video + 2 görsel içerik paylaş.
- Her içerikte aynı renk paletini ve aynı kapanış cümlesini kullan ki marka akılda kalsın.`,
    ];

    return `🎯 Hedef: ${trimmed || "Genel içerik üretimi"}
    
${ideas.join("\n\n")}`;
  }

  function handleSend() {
    if (!userInput || !outputBox) return;

    const text = userInput.value.trim();
    if (!text) {
      showToast("Önce ne üretmek istediğini yaz. 💡");
      userInput.focus();
      return;
    }

    const result = generateContent(text);
    outputBox.textContent = result;
    scrollToSection("sectionResult");
    showToast("Senin için tam bir içerik paketi hazırladım. 🚀");
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", handleSend);
  }

  if (userInput) {
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    });
  }

  /* -----------------------------
     8. Akışa Ara Sıra Otomatik Mesaj Ekle
  --------------------------------*/
  const extraFeed = [
    "“Bugün paylaştığın tek bir içerik, yarın tanışacağın yüzlerce insan demek olabilir.”",
    "“Düzenli üretim, algoritmanın en sevdiği sevgililik tarzıdır.”",
    "“İçeriklerin kusursuz olmak zorunda değil, ama devamlı olmak zorunda.”",
  ];
  let feedIndex = 0;

  setInterval(() => {
    if (!feed) return;
    const div = document.createElement("div");
    div.className = "feed-item";
    div.textContent = extraFeed[feedIndex];
    feed.appendChild(div);
    feedIndex = (feedIndex + 1) % extraFeed.length;
  }, 25000);
});
