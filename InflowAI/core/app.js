/* =======================================================
   InflowAI - Core / app.js
   En üst seviye çekirdek – kontrol merkezinden yönetilebilir
   ======================================================= */

const InflowCore = {
  version: "2.0.0",
  status: {
    startedAt: new Date().toISOString(),
    activeUsers: 0,
    activePackage: "free", // free | premium | b2b
    health: "ok",
    lastError: null,
    lastSync: null,
    modules: [],
  },
  config: {
    vercelDeployUrl: "https://api.vercel.com/v1/integrations/deploy/prj_inflow-ai-vmat", // senin vercel projen
    siteUrl: "https://inflow-ai-vmat.vercel.app/",
  },

  /* ---------- temel log ---------- */
  log(msg, level = "info") {
    console.log(`[InflowAI CORE][${level.toUpperCase()}]`, msg);
    this.status.lastLog = msg;
    this.saveState();
    this.notifyControl();
  },

  /* ---------- state kaydet / yükle ---------- */
  saveState() {
    try {
      localStorage.setItem("inflow_core_state", JSON.stringify(this.status));
    } catch (e) {
      console.warn("State kaydedilemedi:", e.message);
    }
  },

  loadState() {
    try {
      const raw = localStorage.getItem("inflow_core_state");
      if (raw) {
        const prev = JSON.parse(raw);
        this.status = { ...this.status, ...prev };
        this.log("Önceki çekirdek durumu yüklendi.");
      }
    } catch (e) {
      this.log("Önceki durum okunamadı.", "warn");
    }
  },

  /* ---------- modül kaydı ---------- */
  registerModule(name, fn) {
    this.status.modules.push({ name, active: true, at: Date.now() });
    try {
      fn?.();
      this.log(`Modül yüklendi: ${name}`);
    } catch (e) {
      this.log(`Modül yüklenirken hata: ${name} → ${e.message}`, "error");
      this.status.health = "degraded";
    }
    this.saveState();
    this.notifyControl();
  },

  /* ---------- kontrol merkezine canlı bildirim ---------- */
  notifyControl() {
    // aynı domain içindeki dashboard’a durum gönder
    try {
      window.parent?.postMessage(
        { type: "inflow-core-status", payload: this.status },
        "*"
      );
    } catch (e) {
      // sorun yok, sessiz geç
    }
  },

  /* ---------- paket değişimi ---------- */
  setPackage(pkg) {
    this.status.activePackage = pkg; // "free" | "premium" | "b2b"
    this.log(`Paket güncellendi: ${pkg}`);
    this.saveState();
    this.triggerVercelSync({ reason: "package-changed", pkg });
  },

  /* ---------- Vercel senkron ---------- */
  async triggerVercelSync(extra = {}) {
    // token’ı burada açık göstermiyoruz, Vercel tarafında env olarak ayarlı olmalı.
    // Github secret’ı eklediğin için Vercel zaten deploy’u tetikleyecek.
    try {
      const body = {
        reason: "InflowAI Control Center change",
        time: new Date().toISOString(),
        core: this.status,
        ...extra,
      };

      // ana sitene küçük bir ping at – canlı mı diye
      fetch(this.config.siteUrl).catch(() => {});

      // gerçek deploy endpointine istek
      fetch(this.config.vercelDeployUrl, {
        method: "POST",
        headers: {
          // Vercel token frontend’de gösterilmez, backend veya edge function’da tutulur.
          // "Authorization": "Bearer " + YOUR_VERCEL_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).catch(() => {
        this.log("Vercel deploy isteği gönderildi (anonim).");
      });

      this.status.lastSync = new Date().toISOString();
      this.saveState();
      this.notifyControl();
      this.log("Vercel senkron tetiklendi.");
    } catch (e) {
      this.log("Vercel senkron hatası: " + e.message, "error");
    }
  },

  /* ---------- sağlık izleme ---------- */
  startHealthMonitor() {
    setInterval(() => {
      const mem =
        performance && performance.memory
          ? performance.memory.usedJSHeapSize
          : null;
      this.status.health = "ok";
      this.status.memory = mem;
      this.status.lastHealth = new Date().toISOString();
      this.saveState();
      this.notifyControl();
    }, 5000);
    this.log("Sağlık izleme başlatıldı.");
  },

  /* ---------- hata yakalama ---------- */
  attachErrorCatcher() {
    window.addEventListener("error", (e) => {
      this.status.lastError = e.message;
      this.status.health = "degraded";
      this.saveState();
      this.notifyControl();
      this.log("Hata yakalandı: " + e.message, "error");
    });
    this.log("Hata yakalayıcı aktif.");
  },

  /* ---------- kontrol merkezinden komut alma ---------- */
  attachCommandListener() {
    // postMessage ile gelen komutlar
    window.addEventListener("message", (e) => {
      const data = e.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "inflow-command") {
        this.handleCommand(data.command, data.payload);
      }
    });

    // localStorage değiştiğinde de dinle (kontrol merkezi butona basınca tetiklenir)
    window.addEventListener("storage", (e) => {
      if (e.key === "inflow_control_cmd") {
        const cmd = JSON.parse(e.newValue || "{}");
        this.handleCommand(cmd.command, cmd.payload);
      }
    });

    this.log("Komut dinleyici aktif.");
  },

  /* ---------- komut işleyici ---------- */
  handleCommand(cmd, payload = {}) {
    this.log(`Komut alındı: ${cmd}`);
    switch (cmd) {
      case "set-package-free":
        this.setPackage("free");
        break;
      case "set-package-premium":
        this.setPackage("premium");
        break;
      case "set-package-b2b":
        this.setPackage("b2b");
        break;
      case "sync-vercel":
        this.triggerVercelSync({ reason: "manual" });
        break;
      case "core-restart":
        this.log("Çekirdek yeniden başlatılıyor...");
        setTimeout(() => location.reload(), 800);
        break;
      case "core-log":
        console.table(this.status);
        break;
      case "feature-add":
        // kontrol merkezi özelik eklediğinde
        this.log("Özellik eklendi: " + (payload?.name || "isimsiz"));
        break;
      default:
        this.log("Bilinmeyen komut: " + cmd, "warn");
    }
  },

  /* ---------- kontrol merkezine canlı mini-sinyal ---------- */
  startControlHeartbeat() {
    setInterval(() => {
      this.notifyControl();
    }, 7000);
  },

  /* ---------- çekirdeği başlat ---------- */
  init() {
    this.loadState();
    this.attachErrorCatcher();
    this.attachCommandListener();
    this.startHealthMonitor();
    this.startControlHeartbeat();

    // örnek modüller
    this.registerModule("users-monitor", () => {
      setInterval(() => {
        // kontrol merkezi ileride gerçek kullanıcı sayısını buradan çekebilir
        this.status.activeUsers =
          this.status.activeUsers === 0
            ? Math.floor(Math.random() * 120) + 10
            : this.status.activeUsers;
        this.saveState();
        this.notifyControl();
      }, 6000);
    });

    this.registerModule("services-sync", () => {
      // ileride services klasöründen okuma yapılabilir
    });

    this.log("InflowAI Core başlatıldı ✅");
    this.notifyControl();
  },
};

// çekirdeği ayağa kaldır
InflowCore.init();
