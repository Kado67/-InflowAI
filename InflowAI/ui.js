// ui.js
// =======================================================
// InflowAI - Çok sayfalı (7 HTML) canlı frontend beyni
// - İçerikler ve ürünler localStorage'da tutulur
// - Eğlence alanı gerçek sonuçlar üretir (random)
// - Akış sayfası içerik + ürünleri listeler
// =======================================================

(function () {
  // Küçük yardımcılar
  function $(sel) {
    return document.querySelector(sel);
  }
  function $all(sel) {
    return Array.from(document.querySelectorAll(sel));
  }

  const STORAGE_KEYS = {
    CONTENTS: "inflow_contents",
    PRODUCTS: "inflow_products",
  };

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Tarih yardımcıları
  function isToday(iso) {
    const d = new Date(iso);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }

  // -------------------------------------------------------
  // GLOBAL NAV – üst logoya tıklayınca ana sayfaya git vs.
  // -------------------------------------------------------
  function initGlobalNav() {
    const logo = document.querySelector(".nav-logo, header .logo, .brand");
    if (logo) {
      logo.style.cursor = "pointer";
      logo.addEventListener("click", () => {
        window.location.href = "index.html";
      });
    }

    const loginBtn = document.getElementById("btnLogin");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        alert(
          "Giriş & kayıt sistemi çok yakında aktif olacak.\nŞu an tüm ücretsiz özellikler misafir olarak açık. 💜"
        );
      });
    }
  }

  // -------------------------------------------------------
  // ANA SAYFA (index.html)
  // -------------------------------------------------------
  function initHome() {
    if (!location.pathname.endsWith("index.html") && location.pathname !== "/" && location.pathname !== "/InflowAI/") {
      return;
    }

    // Hızlı yönlendirme butonları
    const btnFastContent =
      $("#btnFastContent") || $("#btnQuickContent") || $("#btnProduce");
    const btnFastProduct =
      $("#btnFastProduct") || $("#btnQuickProduct") || $("#btnAddProduct");

    if (btnFastContent) {
      btnFastContent.addEventListener("click", () => {
        window.location.href = "content.html";
      });
    }
    if (btnFastProduct) {
      btnFastProduct.addEventListener("click", () => {
        window.location.href = "product-add.html";
      });
    }

    // Canlı platform özeti
    const contents = load(STORAGE_KEYS.CONTENTS, []);
    const products = load(STORAGE_KEYS.PRODUCTS, []);

    const elTotalContent =
      $("#summaryTotalContent") || $("#summary-total-content");
    const elTotalProducts =
      $("#summaryTotalProducts") || $("#summary-total-products");
    const elActiveUsers =
      $("#summaryActiveUsers") || $("#summary-active-users");
    const elTodayIdeas =
      $("#summaryTodayIdeas") || $("#summary-today-ideas");

    if (elTotalContent) elTotalContent.textContent = contents.length;
    if (elTotalProducts) elTotalProducts.textContent = products.length;

    // Şimdilik aktif kullanıcı = 1 (sen) + misafirler
    if (elActiveUsers) elActiveUsers.textContent = 1;

    const todayIdeasCount = contents.filter((c) => isToday(c.createdAt)).length;
    if (elTodayIdeas) elTodayIdeas.textContent = todayIdeasCount;

    // Ana sayfa akış ön izlemesi (son 5 şey)
    const feedPreview =
      $("#homeFeedPreview") || $("#inflowFeedPreview") || $(".home-feed");
    if (feedPreview) {
      const merged = [
        ...contents.map((c) => ({ type: "content", ...c })),
        ...products.map((p) => ({ type: "product", ...p })),
      ]
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 5);

      if (!merged.length) {
        feedPreview.innerHTML =
          '<p class="empty">Henüz içerik veya ürün yok. İlk paylaşımı sen yap! 🚀</p>';
      } else {
        feedPreview.innerHTML = merged
          .map((item) => {
            if (item.type === "product") {
              return `
              <div class="feed-card">
                <div class="tag">Ürün</div>
                <div class="title">${item.name}</div>
                <div class="meta">${item.price || ""}</div>
              </div>`;
            } else {
              return `
              <div class="feed-card">
                <div class="tag">İçerik</div>
                <div class="title">${item.text}</div>
              </div>`;
            }
          })
          .join("");
      }
    }
  }

  // -------------------------------------------------------
  // İÇERİK ÜRETİCİ (content.html)
  // -------------------------------------------------------
  function initContentPage() {
    if (!location.pathname.endsWith("content.html")) return;

    const input = $("#contentInput") || $("#userInput");
    const selectType = $("#contentType");
    const btnGenerate = $("#btnGenerateContent") || $("#sendBtn");
    const result = $("#contentResult");

    if (btnGenerate && input && result) {
      btnGenerate.addEventListener("click", () => {
        const text = (input.value || "").trim();
        if (!text) {
          alert("Önce ne üretmek istediğini yaz. ✍️");
          return;
        }

        const type = selectType ? selectType.value : "genel";

        // Basit yapay içerik: başlık + 3 madde
        const idea = {
          title: `InflowAI fikri: ${text}`,
          bullets: [
            `${text} için dikkat çekici bir giriş cümlesi yaz.`,
            `İnsanların paylaşmak isteyeceği 1 duygusal cümle ekle.`,
            `Sonuna net bir çağrı ekle: yorum, kayıt ol, takip et vb.`,
          ],
        };

        // LocalStorage'a kaydet
        const list = load(STORAGE_KEYS.CONTENTS, []);
        list.unshift({
          id: Date.now(),
          text: text,
          type,
          idea,
          createdAt: new Date().toISOString(),
        });
        save(STORAGE_KEYS.CONTENTS, list);

        // Ekrana göster
        result.innerHTML = `
          <h3>${idea.title}</h3>
          <ul>
            ${idea.bullets.map((b) => `<li>${b}</li>`).join("")}
          </ul>
          <p class="note">Bu içerik InflowAI akışına ve özetlere eklendi. ✅</p>
        `;

        input.value = "";
      });
    }
  }

  // -------------------------------------------------------
  // ÜRÜN EKLE (product-add.html)
  // -------------------------------------------------------
  function initProductAddPage() {
    if (!location.pathname.endsWith("product-add.html")) return;

    const form = $("#productForm") || $("form");
    const nameInput = $("#productName");
    const priceInput = $("#productPrice");
    const descInput = $("#productDescription");
    const imageInput = $("#productImage");

    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = (nameInput && nameInput.value.trim()) || "";
      const price = (priceInput && priceInput.value.trim()) || "";
      const desc = (descInput && descInput.value.trim()) || "";

      if (!name || !price) {
        alert("Ürün adı ve fiyat zorunlu. 💸");
        return;
      }

      function finishSave(imageData) {
        const list = load(STORAGE_KEYS.PRODUCTS, []);
        list.unshift({
          id: Date.now(),
          name,
          price,
          description: desc,
          imageData: imageData || null,
          createdAt: new Date().toISOString(),
        });
        save(STORAGE_KEYS.PRODUCTS, list);

        alert("Ürün yayınlandı! 🎉 Şimdi markete gidip görebilirsin.");
        window.location.href = "product.html";
      }

      const file = imageInput && imageInput.files && imageInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          finishSave(evt.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        finishSave(null);
      }
    });
  }

  // -------------------------------------------------------
  // ÜRÜN LİSTESİ / MARKET (product.html)
  // -------------------------------------------------------
  function initProductListPage() {
    if (!location.pathname.endsWith("product.html")) return;

    const container = $("#productList") || $(".product-list");
    const emptyEl = $("#productEmpty") || $(".product-empty");

    const list = load(STORAGE_KEYS.PRODUCTS, []);

    if (!container) return;

    if (!list.length) {
      if (emptyEl) {
        emptyEl.textContent =
          "Henüz satışta ürün yok. İlk ürünü sen ekle ve marketi aç. 🛒";
      } else {
        container.innerHTML =
          '<p class="empty">Henüz satışta ürün yok. İlk ürünü sen ekle. 🛒</p>';
      }
      return;
    }

    container.innerHTML = list
      .map((p) => {
        return `
        <div class="product-card">
          ${p.imageData ? `<img src="${p.imageData}" alt="${p.name}" />` : ""}
          <h3>${p.name}</h3>
          <p class="price">${p.price}</p>
          ${
            p.description
              ? `<p class="desc">${p.description}</p>`
              : "<p class='desc muted'>Açıklama eklenmedi.</p>"
          }
        </div>
      `;
      })
      .join("");
  }

  // -------------------------------------------------------
  // EĞLENCE ALANI (fun.html)
  // -------------------------------------------------------
  function initFunPage() {
    if (!location.pathname.endsWith("fun.html")) return;

    const btnCoffee = $("#btnCoffee") || $("#funCoffee");
    const btnHoroscope = $("#btnHoroscope") || $("#funHoroscope");
    const btnAdvice = $("#btnAdvice") || $("#funAdvice");
    const btnQuiz = $("#btnQuiz") || $("#funQuiz");

    const titleEl = $("#funResultTitle");
    const bodyEl = $("#funResultBody");

    function showResult(title, text) {
      if (titleEl) titleEl.textContent = title;
      if (bodyEl) bodyEl.textContent = text;
      if (!titleEl && !bodyEl) {
        alert(`${title}\n\n${text}`);
      }
    }

    // Kahve falı – basit random yorum
    const coffeeFortunes = [
      "Kalbinde tuttuğun bir dilek var, yakında güzel bir haber alacaksın.",
      "Yeni tanışacağın biri hayatına hareket katacak.",
      "Uzun zamandır beklediğin fırsat, hiç beklemediğin bir anda gelecek.",
      "Yoldan haber var; kısa bir seyahat seni bekliyor.",
    ];

    if (btnCoffee) {
      btnCoffee.addEventListener("click", () => {
        const msg =
          coffeeFortunes[Math.floor(Math.random() * coffeeFortunes.length)];
        showResult("☕ Kahve Falın", msg);
      });
    }

    // Burç / Tarot – burç seçimi varsa ona göre, yoksa random
    const horoscopeTexts = [
      "Bugün kendin için küçük ama önemli bir adım at.",
      "Planlamadığın bir buluşma moralini yükseltebilir.",
      "Madde değil, insanlara yatırım yaptığın bir gün olsun.",
      "Uzun zamandır ertelediğin işi bugün bitirmeyi dene.",
    ];

    if (btnHoroscope) {
      btnHoroscope.addEventListener("click", () => {
        const msg =
          horoscopeTexts[Math.floor(Math.random() * horoscopeTexts.length)];
        showResult("🔮 Tarot & Burç Mesajın", msg);
      });
    }

    // Günün tavsiyesi
    const advices = [
      "Bugün en az 15 dakika hiçbir şey üretme, sadece düşün.",
      "Beğendiğin 3 hesabı incele, ortak noktalarını not al.",
      "Eski bir içeriğini tekrar paylaş, üzerine küçük bir güncelleme ekle.",
      "Bugün sadece tek bir platforma odaklan, hepsine değil.",
    ];

    if (btnAdvice) {
      btnAdvice.addEventListener("click", () => {
        const msg = advices[Math.floor(Math.random() * advices.length)];
        showResult("💡 Günün Tavsiyesi", msg);
      });
    }

    // Mini test – çok basit 3 soruluk quiz
    if (btnQuiz) {
      btnQuiz.addEventListener("click", () => {
        const q1 = confirm(
          "Günde en az 1 içerik paylaşmanın uzun vadede büyüme getireceğine inanıyor musun?"
        );
        const q2 = confirm(
          "Bugün en az 1 içerik veya 1 ürün eklemeye niyetli misin?"
        );
        const q3 = confirm(
          "Takipçilerinle yorumlarda daha fazla sohbet etmeye hazır mısın?"
        );

        const score = [q1, q2, q3].filter(Boolean).length;
        let msg = "";
        if (score === 3) {
          msg =
            "⚡ İçerik beyni modundasın! Bugün platform senin için hazır, sen de onun için hazırsın.";
        } else if (score === 2) {
          msg =
            "🔥 Güzel! Küçük bir itişe ihtiyacın var, InflowAI fikir üretmek için seni bekliyor.";
        } else {
          msg =
            "😄 Yavaştan ısınma turundasın. Sadece 1 küçük içerikle başla, gerisi gelir.";
        }
        showResult("😄 Mini Test Sonucu", msg);
      });
    }
  }

  // -------------------------------------------------------
  // AKIŞ SAYFASI (feed.html)
  // -------------------------------------------------------
  function initFeedPage() {
    if (!location.pathname.endsWith("feed.html")) return;

    const container = $("#feedList") || $(".feed-list");
    const emptyEl = $("#feedEmpty") || $(".feed-empty");

    const contents = load(STORAGE_KEYS.CONTENTS, []);
    const products = load(STORAGE_KEYS.PRODUCTS, []);

    if (!container) return;

    const merged = [
      ...contents.map((c) => ({ type: "content", ...c })),
      ...products.map((p) => ({ type: "product", ...p })),
    ].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (!merged.length) {
      if (emptyEl) {
        emptyEl.textContent =
          "Henüz akışta gösterilecek içerik veya ürün yok. İlk adımı sen at. 🚀";
      } else {
        container.innerHTML =
          "<p class='empty'>Akış boş. İçerik üret veya ürün ekle, hepsi burada görünecek.</p>";
      }
      return;
    }

    container.innerHTML = merged
      .map((item) => {
        if (item.type === "product") {
          return `
          <div class="feed-card">
            <div class="tag product">Ürün</div>
            <div class="title">${item.name}</div>
            <div class="meta">${item.price}</div>
          </div>`;
        }
        return `
        <div class="feed-card">
          <div class="tag content">İçerik</div>
          <div class="title">${item.text}</div>
        </div>`;
      })
      .join("");
  }

  // -------------------------------------------------------
  // PROFİL / ÖZET (profile.html)
  // -------------------------------------------------------
  function initProfilePage() {
    if (!location.pathname.endsWith("profile.html")) return;

    const contents = load(STORAGE_KEYS.CONTENTS, []);
    const products = load(STORAGE_KEYS.PRODUCTS, []);

    const elTotalContent =
      $("#profileTotalContent") || $("#summaryTotalContent");
    const elTotalProducts =
      $("#profileTotalProducts") || $("#summaryTotalProducts");

    if (elTotalContent) elTotalContent.textContent = contents.length;
    if (elTotalProducts) elTotalProducts.textContent = products.length;

    const elRecent =
      $("#profileRecentItems") || $(".profile-recent") || null;
    if (elRecent) {
      const merged = [
        ...contents.map((c) => ({ type: "content", ...c })),
        ...products.map((p) => ({ type: "product", ...p })),
      ]
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 10);

      if (!merged.length) {
        elRecent.innerHTML =
          "<p class='empty'>Henüz bir şey üretmedin. İlk içerik veya ürünü ekle, burada gözüksün.</p>";
      } else {
        elRecent.innerHTML = merged
          .map((item) => {
            if (item.type === "product") {
              return `<li><strong>Ürün:</strong> ${item.name} (${item.price})</li>`;
            }
            return `<li><strong>İçerik:</strong> ${item.text}</li>`;
          })
          .join("");
      }
    }
  }

  // -------------------------------------------------------
  // INIT
  // -------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initGlobalNav();
    initHome();
    initContentPage();
    initProductAddPage();
    initProductListPage();
    initFunPage();
    initFeedPage();
    initProfilePage();
  });
})();
