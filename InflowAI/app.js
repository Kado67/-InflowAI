document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const quotaInfo = document.getElementById("quotaInfo");
  const openAuth = document.getElementById("openAuth");
  const authModal = document.getElementById("authModal");
  const closeModal = document.getElementById("closeModal");
  const tabBtns = document.querySelectorAll(".auth-tab");
  const registerPanel = document.getElementById("registerPanel");
  const loginPanel = document.getElementById("loginPanel");
  const doRegister = document.getElementById("doRegister");
  const doLogin = document.getElementById("doLogin");
  const postInput = document.getElementById("postInput");
  const shareBtn = document.getElementById("shareBtn");
  const feedList = document.getElementById("feedList");

  // storage keys
  const GUEST_KEY = "inflow_guest_uses";
  const REG_KEY = "inflow_registered";
  const MAX_GUEST = 3;

  function getGuestUses() {
    return parseInt(localStorage.getItem(GUEST_KEY) || "0", 10);
  }
  function setGuestUses(val) {
    localStorage.setItem(GUEST_KEY, String(val));
  }
  function isRegistered() {
    return localStorage.getItem(REG_KEY) === "1";
  }
  function refreshQuota() {
    if (!quotaInfo) return;
    if (isRegistered()) {
      quotaInfo.textContent = "Kayıtlı: sınırsız";
    } else {
      const left = Math.max(0, MAX_GUEST - getGuestUses());
      quotaInfo.textContent = "Kalan hak: " + left;
    }
  }

  function openModal() {
    if (authModal) authModal.classList.remove("hidden");
  }
  function closeModalFn() {
    if (authModal) authModal.classList.add("hidden");
  }

  if (openAuth) openAuth.addEventListener("click", openModal);
  if (closeModal) closeModal.addEventListener("click", closeModalFn);

  // tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.getAttribute("data-tab");
      if (tab === "register") {
        registerPanel.classList.remove("hidden");
        loginPanel.classList.add("hidden");
      } else {
        loginPanel.classList.remove("hidden");
        registerPanel.classList.add("hidden");
      }
    });
  });

  // register
  if (doRegister) {
    doRegister.addEventListener("click", () => {
      localStorage.setItem(REG_KEY, "1");
      setGuestUses(0);
      refreshQuota();
      closeModalFn();
      alert("Kayıt başarılı (demo) — artık sınırsız.");
    });
  }

  // login
  if (doLogin) {
    doLogin.addEventListener("click", () => {
      localStorage.setItem(REG_KEY, "1");
      refreshQuota();
      closeModalFn();
      alert("Giriş yapıldı (demo).");
    });
  }

  // feed item oluşturucu
  function addFeedItem(text, author = "InflowAI Official") {
    if (!feedList) return;
    const id = "f_" + Math.random().toString(16).slice(2, 7);
    const wrap = document.createElement("div");
    wrap.className = "feed-item";
    wrap.innerHTML = `
      <div class="feed-top">
        <div class="feed-avatar"></div>
        <div>
          <div class="feed-name">${author}</div>
          <div class="feed-time">şimdi</div>
        </div>
      </div>
      <div class="feed-text">${text}</div>
      <div class="feed-actions">
        <button class="feed-btn" data-like="${id}">❤ Beğen</button>
        <button class="feed-btn" data-comment="${id}">💬 Yorum</button>
      </div>
      <div class="feed-likes" id="likes-${id}">0 beğeni</div>
    `;
    feedList.prepend(wrap);
  }

  // beyin otomatik içerik
  const brainTexts = [
    "AI destekli içerik motoru hazır.",
    "Eğlence alanı ziyaretçiyi tutmak için açıldı.",
    "Kayıt olursan bildirimleri yönetebilirsin.",
    "Fal, burç, tavsiye modülleri ayrı ayrı kapatılabilir (sonra)."
  ];
  addFeedItem(brainTexts[0]);
  addFeedItem(brainTexts[1]);

  setInterval(() => {
    const pick = brainTexts[Math.floor(Math.random() * brainTexts.length)];
    addFeedItem(pick);
  }, 28000);

  // gönderi paylaş
  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      const val = (postInput.value || "").trim();
      if (!val) return;

      if (!isRegistered()) {
        const used = getGuestUses();
        if (used >= MAX_GUEST) {
          openModal();
          return;
        } else {
          setGuestUses(used + 1);
          refreshQuota();
        }
      }
      addFeedItem(val, "Sen");
      postInput.value = "";
    });
  }

  // beğeni / yorumda da aynı sınır
  if (feedList) {
    feedList.addEventListener("click", (e) => {
      const t = e.target;
      if (t.matches("[data-like]")) {
        const id = t.getAttribute("data-like");
        const likeEl = document.getElementById("likes-" + id);
        if (!likeEl) return;

        if (!isRegistered()) {
          const used = getGuestUses();
          if (used >= MAX_GUEST) {
            openModal();
            return;
          } else {
            setGuestUses(used + 1);
            refreshQuota();
          }
        }
        const current = parseInt(likeEl.textContent, 10) || 0;
        likeEl.textContent = (current + 1) + " beğeni";
      }

      if (t.matches("[data-comment]")) {
        if (!isRegistered()) {
          openModal();
          return;
        }
        alert("Yorum kaydedildi (demo).");
      }
    });
  }

  // eğlence kartları
  document.querySelectorAll(".fun-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-fun");
      if (type === "coffee") alert("Kahve falı: foto ekleme sonra gelecek.");
      if (type === "horoscope") alert("Bugünkü burç yorumun: Dengeli ol.");
      if (type === "advice") alert("Günün tavsiyesi: Her gün bir içerik ekle.");
      if (type === "quiz") alert("Mini test: bugün AI mı, içerik mi? 🙂");
    });
  });

  refreshQuota();
});
