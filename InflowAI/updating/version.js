// updating/version.js
// Sistemin şu anki istemci sürüm bilgisini tutar.
// Kontrol Merkezi buradaki versiyonu okuyup "güncellendi" diyecek.

const InflowVersion = {
  client: "1.0.0",
  lastUpdated: new Date().toISOString(),
  get() {
    return {
      client: this.client,
      lastUpdated: this.lastUpdated
    };
  },
  setVersion(v) {
    this.client = v;
    this.lastUpdated = new Date().toISOString();
    console.log("[InflowAI Updating] Versiyon güncellendi:", v);
  }
};

console.log("[InflowAI Updating] Version modülü yüklendi.");
