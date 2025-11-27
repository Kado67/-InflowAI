// InflowAI - Ziyaretçi tarafı UI beyni
// Tüm ücretsiz özellikler aktif, kayıt olmayanlara 3 hak sınırı

document.addEventListener("DOMContentLoaded", () => {
  const avatar = document.getElementById("avatar");
  const avatarBubble = document.getElementById("avatarBubble");

  const btnLogin = document.getElementById("btnLogin");
  const btnProduce = document.getElementById("btnProduce");
  const btnExplain = document.getElementById("btnExplain");
  const featureButtons = document.querySelectorAll(".btn-mini");

  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const feedContainer = document.querySelector("#sectionFeed .feed");

  // --- Misafir / kayıtlı kullanıcı mantığı ---
  const GUEST_LIMIT = 3;
  let guestUses = 0;

  function isRegistered() {
    // Gerçek sistemde buraya gerçek login kontrolü gelecek.
    // Şimdilik herkes misafir modunda.
    return false;
  }

  function useRight() {
    if (isRegistered()) return true;

    guestUses++;

    if (guestUses > GUEST_LIMIT) {
      alert("3 hakkın bitti. Devam etmek için kayıt ol.");
      return false;
    }

    if (guestUses === GUEST_LIMIT) {
      alert("Bu son ücretsiz hakkın. Devam etmek için kayıt olabilirsin.");
    }

    return true;
  }

  // --- Avatar konuşmaları ---
  const avatarPhrases = [
    "Hoş geldin, bugün enerjin çok güzel. ✨",
    "Bir cümle yaz, gerisini ben hallederim. 💜",
    "Ziyaretçini içeride tutacak fikirler hazırladım.",
    "Bugün 1 içerik, yarın yeni bir hayat. 🚀",
    "Kahve falı mı, B2B planı mı? Hepsi bende."
  ];

  let avatarIndex = 0;

  function cycleAvatarSpeech() {
    avatarIndex = (avatarIndex + 1) % avatarPhrases.length;
    avatarBubble.textContent = avatarPhrases[avatarIndex];
    avatar.classList.add("avatar-pulse");
    setTimeout(() => avatar.classList.remove("avatar-pulse"), 600);
  }

  setInterval(cycleAvatarSpeech, 8000);

  // --- Yardımcı: Bölüme kaydır ---
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // --- Feed'e yeni içerik ekleme ---
  function pushToFeed(text) {
    if (!feedContainer) return;
    const item = document.createElement("div");
    item.className = "feed-item";
    item.textContent = text;
    feedContainer.prepend(item);
  }

  // Kullanıcının yazdığına göre örnek cevaplar üretelim (fake ama yaşayan hissetsin)
  function generateContentIdea(promptText) {
    const base = promptText || "Bugünün enerjisi";

    const ideas = [
      `Senin için bir içerik fikri: "${base}" temalı bir Reels serisi. İlk video: 15 saniyede güçlü bir soru sor.`,
      `"${base}" başlıklı bir blog yazısı yaz. Girişte problemi anlat, ortada 3 maddeyle çözüm ver, sonda çağrı yap.`,
      `Story serisi: 3 ekranda "${base}" hakkında mini ipuçları paylaş. Son ekranda InflowAI'den bahset.`,
      `"${base}" için bir karusel post: 5 slide. 1: başlık, 2-4: ipuçları, 5: aksiyon çağrısı.`,
      `Kısa video fikri: Önce sorunu söyle, sonra "${base}" çözümü için 3 hızlı adım göster.`
    ];

    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    pushToFeed("🧠 İçerik Fikri: " + idea);
  }

  function generateFunAction(type) {
    const items = {
      coffee: [
        "Kahve falı: Bugün aklına gelen fikirleri not al, içlerinden biri hayatını değiştirebilir. ☕",
        "Fincanın dibinde büyük bir fırsat görüyorum, erteleme!"
      ],
      astro: [
        "Burç yorumu: Bugün iletişim gücün çok yüksek, takipçilerinle konuşmak için iyi zaman. 🔮",
        "Mini tarot: Çektiğin kart 'Güneş'. Görünür olmaktan korkma."
      ],
      advice: [
        "Günün tavsiyesi: Her gün en az 1 içerik. Devamı kendiliğinden gelir. 💡",
        "Bugün kendini eleştirmek yerine ürettiğin için teşekkür et."
      ],
      quiz: [
        "Mini test: Bugün 1 mi 3 mü içerik üreteceksin? Karar ver ve uygulamadan çıkmadan birini bitir. 😄",
        "Kendine sor: 'Takipçime bugün gerçekten nasıl yardım edebilirim?'"
      ]
    };

    const list = items[type] || [];
    if (!list.length) return;
    const msg = list[Math.floor(Math.random() * list.length)];
    pushToFeed(msg);
  }

  function generateB2BIdea() {
    const samples = [
      "B2B planı: Haftada 3 eğitim postu, 1 başarı hikayesi, 1 satış odaklı paylaşım.",
      "Rapor fikri: Aylık içerik performansını topla, en iyi 5 içeriği yeniden kullan.",
      "Şablon önerisi: 'Soru - Hata - Çözüm' formatında LinkedIn post serisi."
    ];
    const msg = samples[Math.floor(Math.random() * samples.length)];
    pushToFeed("📊 B2B Panelinden Öneri: " + msg);
  }

  // --- Giriş butonu ---
  btnLogin?.addEventListener("click", () => {
    alert(
      "Giriş bölümü yakında aktif olacak. Şu an ücretsiz misafir modundasın."
    );
  });

  // --- Hemen içerik üret ---
  btnProduce?.addEventListener("click", () => {
    if (!useRight()) return;
    scrollToSection("sectionFeatures");
    generateContentIdea("Bugünün içeriği");
    avatarBubble.textContent =
      "Senin için birkaç fikir ürettim, aşağıya bak. 💜";
  });

  // --- Platform bana ne yapıyor? ---
  btnExplain?.addEventListener("click", () => {
    scrollToSection("sectionFeatures");
    avatarBubble.textContent =
      "Aşağıda senin için içerik, eğlence ve B2B alanlarını anlattım. ✨";
  });

  // --- Kart butonları (Canlı içerik / Eğlence / B2B) ---
  featureButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;

      if (target === "content") {
        if (!useRight()) return;
        generateContentIdea("Sosyal medya içeriği");
        avatarBubble.textContent =
          "Yeni bir içerik fikri ürettim, akışa ekledim. 🚀";
        scrollToSection("sectionFeed");
      }

      if (target === "fun") {
        if (!useRight()) return;
        scrollToSection("sectionFun");
        generateFunAction("advice");
        avatarBubble.textContent = "Eğlence alanından bir fikir gönderdim. 😄";
      }

      if (target === "b2b") {
        if (!useRight()) return;
        generateB2BIdea();
        avatarBubble.textContent =
          "İşletmeler için bir B2B içerik fikri hazırladım. 📊";
        scrollToSection("sectionFeed");
      }
    });
  });

  // --- Kullanıcı inputu -> içerik üretimi ---
  sendBtn?.addEventListener("click", () => {
    const text = (userInput.value || "").trim();
    if (!text) {
      alert("Önce ne üretmek istediğini yaz.");
      return;
    }

    if (!useRight()) return;

    generateContentIdea(text);
    avatarBubble.textContent =
      "Tamamdır, aşağıya senin için bir içerik fikri bıraktım. 💜";
    userInput.value = "";
  });

  userInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn.click();
    }
  });
});
