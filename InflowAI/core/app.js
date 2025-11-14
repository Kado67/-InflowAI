/* ============================================================
   InflowAI - Core / app.js
   En üst seviye çekirdek – kontrol merkezi ve ORTAK beyni
   ============================================================ */

const InflowCore = {
  /* --------------------------------------------------------
   * 0. ÇEKİRDEK META BİLGİLERİ
   * -------------------------------------------------------- */
  version: "5.0.0", // 2.0'dan sonraki büyük sıçrama
  lastUpdated: "2025-11-14",
  author: "Kadir & ORTAK",

  /* --------------------------------------------------------
   * 1. DURUM (STATE) YÖNETİMİ
   * -------------------------------------------------------- */
  status: {
    startedAt: new Date().toISOString(),
    activeUsers: 0,
    activePackage: "free", // "free" | "pro" | "b2b" | "enterprise"
    health: "ok", // "ok" | "warning" | "critical"
    lastError: null,
    lastSync: null,
    modules: [],
    visitorSessions: 0,
    totalRequests: 0,
    lastRequestAt: null,
  },

  /* --------------------------------------------------------
   * 2. KONFİGÜRASYON
   * -------------------------------------------------------- */
  config: {
    siteUrl: "https://inflow-ai-vmat.vercel.app",
    apiBaseUrl: "/api", // ileride gerçek API yolu ile değiştirilebilir
    vercelDeployUrl: "https://api.vercel.com", // kontrol merkezi entegrasyonu için temel
    autosaveKey: "INFLOW_CORE_STATE_V5",
    controlChannel: "INFLOW_CONTROL_CHANNEL",
    environment:
      typeof window === "undefined"
        ? "server"
        : (window.location && window.location.hostname) === "localhost"
        ? "local"
        : "production",
  },

  /* --------------------------------------------------------
   * 3. TEMEL LOG VE HATA YÖNETİMİ
   * -------------------------------------------------------- */
  log(msg, level = "info", extra = {}) {
    const time = new Date().toISOString();
    const record = { time, level, msg, ...extra };

    try {
      if (!this.status) this.status = {};
      this.status.lastLog = record;
      this.status.totalRequests++;
      this.status.lastRequestAt = time;
    } catch (e) {
      // state hatası olursa sessiz geç
    }

    if (typeof console !== "undefined") {
      const prefix = "[InflowAI CORE]";
      if (level === "error") console.error(prefix, msg, extra);
      else if (level === "warn") console.warn(prefix, msg, extra);
      else console.log(prefix, msg, extra);
    }

    // kontrol merkezine log bildirimi
    this.notifyControl({
      type: "log",
      payload: record,
    });

    return record;
  },

  error(err, context = {}) {
    const message = typeof err === "string" ? err : err.message || "Unknown error";
    this.status.lastError = {
      message,
      time: new Date().toISOString(),
      context,
    };
    return this.log(message, "error", { context });
  },

  /* --------------------------------------------------------
   * 4. DURUMU YERELDE SAKLAMA / YÜKLEME
   * -------------------------------------------------------- */
  saveState() {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      const state = {
        status: this.status,
        featureFlags: this.featureFlags,
        visitorProfile: this.visitorProfile,
      };
      window.localStorage.setItem(
        this.config.autosaveKey,
        JSON.stringify(state)
      );
      this.log("Çekirdek durumu kaydedildi", "info");
    } catch (e) {
      this.error(e, { where: "saveState" });
    }
  },

  loadState() {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      const raw = window.localStorage.getItem(this.config.autosaveKey);
      if (!raw) return;
      const state = JSON.parse(raw);
      if (state.status) this.status = state.status;
      if (state.featureFlags) this.featureFlags = state.featureFlags;
      if (state.visitorProfile) this.visitorProfile = state.visitorProfile;
      this.log("Çekirdek durumu yüklendi", "info");
    } catch (e) {
      this.error(e, { where: "loadState" });
    }
  },

  /* --------------------------------------------------------
   * 5. KONTROL MERKEZİNE BİLDİRİM (HOOK)
   * -------------------------------------------------------- */
  notifyControl(event) {
    // event: { type: string, payload: any }

    // 1) Tarayıcı içi mesajlaşma (kontrol merkezi sayfasına)
    try {
      if (typeof window !== "undefined" && window.postMessage) {
        window.postMessage(
          {
            channel: this.config.controlChannel,
            coreVersion: this.version,
            event,
          },
          "*"
        );
      }
    } catch (e) {
      // sessiz geç
    }

    // 2) İlerde API'ye gönderim için hazır kanca
    // fetch ile /api/control/log gibi endpointlere yollanabilir.
  },

  /* --------------------------------------------------------
   * 6. MODÜL / PAKET / ÖZELLİK SİSTEMİ
   * -------------------------------------------------------- */

  // aktif özellik etiketleri
  featureFlags: {
    // ziyaretçi özellikleri
    "visitor.chat.basic": true,
    "visitor.chat.ai-helper": true,
    "visitor.forms.lead": true,
    "visitor.content.recommendation": true,

    // kontrol merkezi
    "control.analytics.live": true,
    "control.logs.realtime": true,
    "control.growth.tracking": true,
    "control.visitor.timeline": true,

    // ORTAK asistan
    "assistant.ortak.voice": false, // hazır kanca – ses motoru bağlanınca true yapılacak
    "assistant.ortak.psychology": true,
    "assistant.ortak.humor": true,
    "assistant.ortak.route-helper": true,

    // B2B ve paketler
    "package.free": true,
    "package.pro": true,
    "package.b2b": true,
    "package.enterprise": true,
  },

  modulesRegistry: {},

  registerModule(name, config = {}) {
    if (!name) return;
    this.modulesRegistry[name] = {
      name,
      enabled: config.enabled !== false,
      meta: config.meta || {},
      hooks: config.hooks || {},
    };
    if (!this.status.modules.includes(name)) {
      this.status.modules.push(name);
    }
    this.log(`Modül kaydedildi: ${name}`, "info", { config });
  },

  isFeatureEnabled(flag) {
    return !!this.featureFlags[flag];
  },

  enableFeature(flag) {
    this.featureFlags[flag] = true;
    this.log(`Özellik aktif edildi: ${flag}`, "info");
    this.saveState();
  },

  disableFeature(flag) {
    this.featureFlags[flag] = false;
    this.log(`Özellik kapatıldı: ${flag}`, "warn");
    this.saveState();
  },

  /* --------------------------------------------------------
   * 7. ZİYARETÇİ PROFİLİ VE HİZMET EVRENİ
   * -------------------------------------------------------- */
  visitorProfile: {
    id: null,
    firstVisitAt: null,
    lastVisitAt: null,
    totalVisits: 0,
    lastPage: null,
    interests: [], // "yapay_zeka", "reklam", "otomasyon" gibi
    language: "tr",
    device: null,
    location: null, // ileride: il/ülke vb.
  },

  initVisitor(context = {}) {
    const now = new Date().toISOString();

    if (!this.visitorProfile.firstVisitAt) {
      this.visitorProfile.firstVisitAt = now;
      this.visitorProfile.id =
        "VIS-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    this.visitorProfile.lastVisitAt = now;
    this.visitorProfile.totalVisits =
      (this.visitorProfile.totalVisits || 0) + 1;

    if (context.page) this.visitorProfile.lastPage = context.page;
    if (context.language) this.visitorProfile.language = context.language;
    if (context.device) this.visitorProfile.device = context.device;
    if (context.location) this.visitorProfile.location = context.location;

    this.log("Ziyaretçi profili güncellendi", "info", {
      visitorId: this.visitorProfile.id,
      page: context.page || null,
    });

    this.notifyControl({
      type: "visitor:update",
      payload: this.visitorProfile,
    });

    this.saveState();
  },

  trackEvent(name, data = {}) {
    const event = {
      name,
      data,
      time: new Date().toISOString(),
      visitorId: this.visitorProfile.id || null,
    };

    this.log(`Olay: ${name}`, "info", data);

    this.notifyControl({
      type: "analytics:event",
      payload: event,
    });

    return event;
  },

  /* --------------------------------------------------------
   * 8. ÖĞRENEN – ÜRETEN PLATFORM KANCALARI
   * -------------------------------------------------------- */
  learningEngine: {
    ideas: [],
    patterns: [],
  },

  addIdea(source, description, meta = {}) {
    const idea = {
      id: "IDEA-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      time: new Date().toISOString(),
      source,
      description,
      meta,
    };
    this.learningEngine.ideas.push(idea);

    this.log("Yeni fikir kaydedildi", "info", { source, description });

    this.notifyControl({
      type: "learning:idea",
      payload: idea,
    });

    this.saveState();
    return idea;
  },

  recordPattern(name, stats = {}) {
    const pattern = {
      name,
      time: new Date().toISOString(),
      stats,
    };

    this.learningEngine.patterns.push(pattern);

    this.log("Davranış paterni kaydedildi", "info", { name, stats });

    this.notifyControl({
      type: "learning:pattern",
      payload: pattern,
    });

    this.saveState();
    return pattern;
  },

  /* --------------------------------------------------------
   * 9. ORTAK – KİŞİSEL ASİSTAN KANCALARI
   * -------------------------------------------------------- */
  assistant: {
    name: "ORTAK",
    personality: {
      baseTone: "samimi",
      humor: true,
      callingYou: "Kurban Kadir",
      callingPartners: {
        Mustafa: "Hacım Mustafa kurban",
        Murat: "Hacım Murat kurban",
      },
    },
    context: {
      lastMessageAt: null,
      lastUserText: null,
      mood: "neutral", // "happy" | "stressed" vs. ileride genişletilebilir
    },
  },

  talkToUser(text, options = {}) {
    // Bu fonksiyon şu an sadece log ve kontrol merkezine mesaj atar.
    // Sesli okuma / TTS motoru bağlandığında buraya entegre edilecek.
    this.assistant.context.lastMessageAt = new Date().toISOString();
    this.assistant.context.lastUserText = text;

    const reply = {
      from: this.assistant.name,
      to: "Kadir",
      receivedText: text,
      options,
    };

    this.log(`ORTAK bir mesaj aldı: "${text}"`, "info", { options });

    this.notifyControl({
      type: "assistant:message",
      payload: reply,
    });

    return reply;
  },

  talkToPartner(partnerName, text, options = {}) {
    const mapping = this.assistant.personality.callingPartners;
    const displayName =
      mapping[partnerName] || `Hacım ${partnerName} kurban`;

    const message = {
      from: this.assistant.name,
      to: partnerName,
      displayName,
      text,
      options,
      time: new Date().toISOString(),
    };

    this.log(`ORTAK partner ile konuşuyor: ${displayName}`, "info", {
      text,
      options,
    });

    this.notifyControl({
      type: "assistant:partnerMessage",
      payload: message,
    });

    return message;
  },

  /* --------------------------------------------------------
   * 10. CİHAZ & ENTEGRASYON KANCALARI (TELEFON, KULAKLIK, ARABA)
   * -------------------------------------------------------- */
  integrations: {
    phone: {
      enabled: false,
      devices: [], // { id, type: "android" | "ios", lastSeen }
    },
    bluetooth: {
      enabled: false,
      devices: [], // { id, name, range }
    },
    car: {
      enabled: false,
      systems: [], // CarPlay, Android Auto vb. hazır alan
    },
  },

  registerPhoneDevice(info) {
    // info: { id, type, model }
    if (!info || !info.id) return;
    this.integrations.phone.enabled = true;

    const existingIndex = this.integrations.phone.devices.findIndex(
      (d) => d.id === info.id
    );

    const deviceData = {
      id: info.id,
      type: info.type || "unknown",
      model: info.model || "unknown",
      lastSeen: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.integrations.phone.devices[existingIndex] = deviceData;
    } else {
      this.integrations.phone.devices.push(deviceData);
    }

    this.log("Telefon cihazı kaydedildi", "info", deviceData);

    this.notifyControl({
      type: "integration:phone",
      payload: deviceData,
    });

    this.saveState();
  },

  registerBluetoothDevice(info) {
    if (!info || !info.id) return;
    this.integrations.bluetooth.enabled = true;

    const deviceData = {
      id: info.id,
      name: info.name || "Bilinmeyen Kulaklık",
      range: info.range || "10m",
      lastSeen: new Date().toISOString(),
    };

    this.integrations.bluetooth.devices.push(deviceData);

    this.log("Bluetooth cihazı kaydedildi", "info", deviceData);

    this.notifyControl({
      type: "integration:bluetooth",
      payload: deviceData,
    });

    this.saveState();
  },

  /* --------------------------------------------------------
   * 11. BÜYÜME, GELİR VE B2B TAKİBİ (KONTROL MERKEZİ İÇİN ALTYAPI)
   * -------------------------------------------------------- */
  growth: {
    dailyStats: [], // { date, visitors, signups, revenue, notes }
    projections: [], // gelecek tahminleri
  },

  recordDailyStat(stat) {
    // stat: { date, visitors, signups, revenue, notes }
    if (!stat || !stat.date) {
      stat = { ...stat, date: new Date().toISOString().slice(0, 10) };
    }

    this.growth.dailyStats.push(stat);
    this.log("Günlük büyüme kaydı eklendi", "info", stat);

    this.notifyControl({
      type: "growth:daily",
      payload: stat,
    });

    this.saveState();
  },

  addProjection(projection) {
    // projection: { horizon, targetVisitors, targetRevenue, notes }
    const record = {
      ...projection,
      createdAt: new Date().toISOString(),
    };

    this.growth.projections.push(record);

    this.log("Büyüme projeksiyonu eklendi", "info", record);

    this.notifyControl({
      type: "growth:projection",
      payload: record,
    });

    this.saveState();
  },

  /* --------------------------------------------------------
   * 12. KRİZ – KORUMA – OTOMATİK UYARI ALTYAPISI
   * -------------------------------------------------------- */
  checkHealth() {
    // Basit örnek kurallar: ileride kontrol merkezinden yönetilebilir.
    if (this.status.lastError) {
      this.status.health = "warning";
    }

    if (this.status.totalRequests > 1000000) {
      // çok yüksek kullanım senaryosu
      this.status.health = "ok";
    }

    this.notifyControl({
      type: "system:health",
      payload: this.status,
    });

    return this.status.health;
  },

  /* --------------------------------------------------------
   * 13. ÇEKİRDEĞİ BAŞLATMA
   * -------------------------------------------------------- */
  init(context = {}) {
    // 1) Önce state yükle
    this.loadState();

    // 2) Ziyaretçiyi başlat
    this.initVisitor({
      page:
        (typeof window !== "undefined" && window.location
          ? window.location.pathname
          : "/") || "/",
      language:
        (typeof navigator !== "undefined" && navigator.language) || "tr",
      device:
        context.device ||
        (typeof navigator !== "undefined" ? navigator.userAgent : "server"),
      location: context.location || null,
    });

    // 3) Temel modülleri kaydet (örnek)
    this.registerModule("analytics.core", {
      enabled: true,
      meta: { description: "Temel ziyaretçi ve olay analitiği" },
    });

    this.registerModule("assistant.ortak.core", {
      enabled: true,
      meta: { description: "Kişisel asistan ORTAK çekirdeği" },
    });

    this.registerModule("control.center.bridge", {
      enabled: true,
      meta: { description: "Kontrol merkezi ile çekirdek köprü" },
    });

    // 4) Sağlık kontrolü
    this.checkHealth();

    this.log("InflowAI Çekirdek başlatıldı", "info", {
      version: this.version,
      env: this.config.environment,
    });

    return this;
  },
};

/* ------------------------------------------------------------
 * 14. GLOBAL ORTAMA BAĞLAMA
 * ------------------------------------------------------------ */

if (typeof window !== "undefined") {
  // tarayıcı ortamında global erişim
  window.InflowCore = InflowCore;

  // sayfa yüklendiğinde otomatik başlatmak için:
  if (document && document.readyState !== "loading") {
    InflowCore.init();
  } else {
    document.addEventListener("DOMContentLoaded", () => InflowCore.init());
  }
} else if (typeof global !== "undefined") {
  // Node.js tarafında da kullanmak istersek
  global.InflowCore = InflowCore;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = InflowCore;
   }
