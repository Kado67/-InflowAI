/* =========================================================
   InflowAI - Core / app.js
   En üst seviye çekirdek – kontrol merkezi beynı
   ========================================================= */

const InflowCore = {
  /* ----------------- temel kimlik ----------------- */
  version: "3.0.0", // Evrensel çekirdek versiyonu
  name: "InflowAI CORE",
  environment: process.env.NODE_ENV || "production",

  /* ----------------- durum bilgisi ----------------- */
  status: {
    startedAt: new Date().toISOString(),
    lastHeartbeat: null,
    health: "ok", // ok | warn | error
    activeUsers: 0,
    activeSessions: 0,
    activePackage: "free", // free | premium | enterprise | b2b
    lastError: null,
    lastSync: null,
    modulesLoaded: [],
    featureAutoMode: true, // ufak özellikleri otomatik aç/kapat
  },

  /* ----------------- genel yapılandırma ----------------- */
  config: {
    siteUrl: "https://inflow-ai-vmat.vercel.app",
    vercelDeployUrl: "https://api.vercel.com",
    telemetryEnabled: true,
    maxAutoFeatures: 9000000000, // ufak özellik sınırı (sembolik çok yüksek)
    heartbeatIntervalMs: 15_000, // 15 sn
    autoTuneIntervalMs: 60_000,  // 1 dk
  },

  /* ----------------- çekirdek veriler ----------------- */
  metrics: {
    // canlı sayılar – kontrol merkezine akacak
    visits: {
      total: 0,
      today: 0,
      last24h: 0,
    },
    users: {
      registered: 0,
      online: 0,
      returning: 0,
    },
    performance: {
      avgResponseMs: 0,
      lastResponseMs: 0,
      uptimeSeconds: 0,
    },
    errors: {
      total: 0,
      lastErrorAt: null,
      byType: {},
    },
    growth: {
      // günlük büyüme ve trend tahmini
      dailyRates: [], // örn: [{ date: '2025-11-14', rate: 1.34 }]
      lastCalculatedAt: null,
    },
  },

  /* ----------------- özellik kayıt sistemi ----------------- */
  features: {
    // örnek ufak özellikler – burada milyonlarcasının iskeleti var
    // gerçek mantık modüllerde olacak, burası sadece yönetim beyni
    core_logging: {
      id: "core_logging",
      group: "core",
      description: "Temel loglama ve izleme",
      enabled: true,
      level: "info", // info | debug | warn | error
      auto: true, // otomatik yönetilebilir ufak özellik
    },
    smart_welcome_banner: {
      id: "smart_welcome_banner",
      group: "ux",
      description:
        "Ziyaretçiye saate ve cihaza göre akıllı karşılama mesajı gösterir.",
      enabled: true,
      auto: true,
    },
    ai_content_suggestions: {
      id: "ai_content_suggestions",
      group: "ai",
      description:
        "Ziyaretçinin davranışına göre içerik ve özellik önerileri üretir.",
      enabled: true,
      auto: true,
    },
    free_user_reactivation_nudges: {
      id: "free_user_reactivation_nudges",
      group: "growth",
      description:
        "Uzun süredir gelmeyen ücretsiz kullanıcıları geri çağırmak için ufak tetikleyiciler.",
      enabled: true,
      auto: true,
    },
  },

  /* -------------- yardımcı depolar (state, kontrol) -------------- */
  _controlCenterClient: null, // ileride kontrol merkezi arayüzüne bağlanacak
  _storageAdapter: null, // localStorage / veritabanı / API vs.
  _timers: {
    heartbeat: null,
    autoTune: null,
  },

  /* ================== TEMEL ARAÇ FONKSİYONLAR ================== */

  log(msg, level = "info", extra = {}) {
    const time = new Date().toISOString();
    if (this.features.core_logging?.enabled) {
      // Konsola yaz
      // İleride burayı log servislerine, veritabanına yönlendirebilirsin.
      console.log(`[InflowAI CORE][${level.toUpperCase()}][${time}]`, msg, extra);
    }

    // son log bilgisi kontrol merkezine gönderilebilsin
    this.status.lastLog = { time, level, msg, extra };
    this._notifyControlCenter("log", this.status.lastLog);
  },

  setHealth(status, reason = null) {
    this.status.health = status;
    if (reason) {
      this.status.lastError = reason;
      this.metrics.errors.total++;
      this.metrics.errors.lastErrorAt = new Date().toISOString();
      const type = reason.type || "unknown";
      this.metrics.errors.byType[type] = (this.metrics.errors.byType[type] || 0) + 1;
    }
    this._notifyControlCenter("health", {
      health: this.status.health,
      lastError: this.status.lastError,
    });
  },

  /* ================== METRİK VE BÜYÜME BEYNİ ================== */

  recordVisit({ isNewUser = false, isReturning = false } = {}) {
    const now = new Date();
    const dayKey = now.toISOString().slice(0, 10); // YYYY-MM-DD

    this.metrics.visits.total++;
    this.metrics.visits.last24h++;
    if (!this.metrics.visits.byDay) this.metrics.visits.byDay = {};
    if (!this.metrics.visits.byDay[dayKey]) {
      this.metrics.visits.byDay[dayKey] = 0;
    }
    this.metrics.visits.byDay[dayKey]++;

    if (isNewUser) this.metrics.users.registered++;
    if (isReturning) this.metrics.users.returning++;

    this._notifyControlCenter("visit", {
      total: this.metrics.visits.total,
      today: this.metrics.visits.byDay[dayKey],
      last24h: this.metrics.visits.last24h,
    });
  },

  recordPerformance({ responseMs }) {
    const m = this.metrics.performance;
    m.lastResponseMs = responseMs;
    const now = Date.now();
    if (!m._samples) m._samples = [];
    m._samples.push({ t: now, ms: responseMs });
    if (m._samples.length > 50) m._samples.shift();

    const sum = m._samples.reduce((acc, s) => acc + s.ms, 0);
    m.avgResponseMs = Math.round(sum / m._samples.length);

    this._notifyControlCenter("performance", {
      avgResponseMs: m.avgResponseMs,
      lastResponseMs: m.lastResponseMs,
    });
  },

  updateUptime() {
    const started = new Date(this.status.startedAt).getTime();
    const now = Date.now();
    this.metrics.performance.uptimeSeconds = Math.floor((now - started) / 1000);
  },

  calculateGrowth() {
    const byDay = this.metrics.visits.byDay || {};
    const days = Object.keys(byDay).sort();
    if (days.length < 2) return;

    const rates = [];
    for (let i = 1; i < days.length; i++) {
      const prev = byDay[days[i - 1]];
      const curr = byDay[days[i]];
      if (prev > 0) {
        const rate = (curr - prev) / prev; // oran
        rates.push({ date: days[i], rate });
      }
    }
    this.metrics.growth.dailyRates = rates;
    this.metrics.growth.lastCalculatedAt = new Date().toISOString();

    this._notifyControlCenter("growth", {
      dailyRates: rates.slice(-7), // son 7 gün
    });
  },

  /* ================== ÖZELLİK YÖNETİMİ (BEYİN) ================== */

  registerFeature(featureConfig) {
    if (!featureConfig || !featureConfig.id) return;
    this.features[featureConfig.id] = {
      enabled: false,
      auto: true,
      group: "custom",
      ...featureConfig,
    };
    this.status.modulesLoaded.push(featureConfig.id);
    this._notifyControlCenter("feature_registered", featureConfig);
  },

  enableFeature(id) {
    if (!this.features[id]) return;
    this.features[id].enabled = true;
    this._notifyControlCenter("feature_toggled", {
      id,
      enabled: true,
    });
  },

  disableFeature(id) {
    if (!this.features[id]) return;
    this.features[id].enabled = false;
    this._notifyControlCenter("feature_toggled", {
      id,
      enabled: false,
    });
  },

  isFeatureEnabled(id) {
    return !!this.features[id]?.enabled;
  },

  /* ------- ufak özellikleri otomatik aç/kapat (auto-tune) ------- */
  autoTuneFeatures() {
    if (!this.status.featureAutoMode) return;
    if (!this.metrics.visits.dailyRates || !this.metrics.visits.byDay) return;

    try {
      const byDay = this.metrics.visits.byDay;
      const days = Object.keys(byDay).sort();
      if (days.length < 3) return;

      const today = days[days.length - 1];
      const prev = days[days.length - 2];

      const todayVisits = byDay[today];
      const prevVisits = byDay[prev] || 1;
      const growthRate = (todayVisits - prevVisits) / prevVisits;

      // basit örnek kararlar (ileride ML ile değiştirilebilir):
      if (growthRate >= 0.5) {
        // hızlı büyüme – daha fazla ufak özellik aç
        Object.values(this.features).forEach((f) => {
          if (f.auto && !f.enabled) f.enabled = true;
        });
      } else if (growthRate < 0) {
        // düşüş varsa bazı ufak özellikleri kapat/dengele
        Object.values(this.features).forEach((f) => {
          if (f.auto && f.group === "ux") f.enabled = false;
        });
      }

      this._notifyControlCenter("auto_tune", {
        growthRate,
        snapshot: Object.keys(this.features).map((k) => ({
          id: k,
          enabled: this.features[k].enabled,
        })),
      });
    } catch (err) {
      this.setHealth("warn", { type: "auto_tune_error", message: err.message });
    }
  },

  /* ================== DIŞ SİSTEMLERE BAĞLANTI ================== */

  attachControlCenter(client) {
    // client: { send(eventType, payload) { ... } }
    this._controlCenterClient = client;
    this._notifyControlCenter("core_attached", {
      version: this.version,
      startedAt: this.status.startedAt,
      environment: this.environment,
    });
  },

  attachStorage(adapter) {
    // adapter: { save(key, value), load(key), remove(key) }
    this._storageAdapter = adapter;
  },

  async saveState() {
    if (!this._storageAdapter) return;
    const snapshot = {
      status: this.status,
      metrics: this.metrics,
      features: this.features,
      savedAt: new Date().toISOString(),
    };
    try {
      await this._storageAdapter.save("inflow_core_state", snapshot);
      this._notifyControlCenter("state_saved", { ok: true });
    } catch (err) {
      this.setHealth("warn", { type: "storage_save_error", message: err.message });
    }
  },

  async loadState() {
    if (!this._storageAdapter) return;
    try {
      const snapshot = await this._storageAdapter.load("inflow_core_state");
      if (!snapshot) return;
      this.status = { ...this.status, ...snapshot.status };
      this.metrics = { ...this.metrics, ...snapshot.metrics };
      this.features = { ...this.features, ...snapshot.features };
      this._notifyControlCenter("state_loaded", {
        savedAt: snapshot.savedAt,
      });
    } catch (err) {
      this.setHealth("warn", { type: "storage_load_error", message: err.message });
    }
  },

  /* ================== KALP ATIŞI (HEARTBEAT) ================== */

  start() {
    this.log("InflowAI CORE başlatıldı.", "info");
    this.status.startedAt = new Date().toISOString();
    this.status.lastHeartbeat = this.status.startedAt;

    // uptime güncelle
    this.updateUptime();

    // kalp atışı
    if (this._timers.heartbeat) clearInterval(this._timers.heartbeat);
    this._timers.heartbeat = setInterval(() => {
      this.status.lastHeartbeat = new Date().toISOString();
      this.updateUptime();
      this._notifyControlCenter("heartbeat", {
        lastHeartbeat: this.status.lastHeartbeat,
        uptimeSeconds: this.metrics.performance.uptimeSeconds,
        health: this.status.health,
      });
    }, this.config.heartbeatIntervalMs);

    // auto-tune
    if (this._timers.autoTune) clearInterval(this._timers.autoTune);
    this._timers.autoTune = setInterval(() => {
      this.calculateGrowth();
      this.autoTuneFeatures();
    }, this.config.autoTuneIntervalMs);
  },

  stop() {
    if (this._timers.heartbeat) clearInterval(this._timers.heartbeat);
    if (this._timers.autoTune) clearInterval(this._timers.autoTune);
    this._timers.heartbeat = null;
    this._timers.autoTune = null;
    this.log("InflowAI CORE durduruldu.", "warn");
  },

  /* ================== İÇ YARDIMCI FONKSİYONLAR ================== */

  _notifyControlCenter(type, payload) {
    if (!this._controlCenterClient) return;
    try {
      this._controlCenterClient.send(type, {
        type,
        payload,
        at: new Date().toISOString(),
      });
    } catch (err) {
      // kontrol merkezine gönderilemese bile çekirdek çalışmaya devam etsin
      console.warn("[InflowAI CORE] Kontrol merkezine bildirim gönderilemedi:", err);
    }
  },
};

/* CommonJS ve ES Module için dışa aktarma */
module.exports = InflowCore;
module.exports.InflowCore = InflowCore;
export default InflowCore;
export { InflowCore };
