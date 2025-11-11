// updating/update.js
// Uzaktan veya kontrol merkezinden gelen "şu özelliği aç/kapat" komutlarını uygular gibi davranır.
// Şimdilik localStorage üstünden simüle ediyoruz.

const InflowUpdater = {
  KEY_QUEUE: "inflow_update_queue",
  applyQueued() {
    const raw = localStorage.getItem(this.KEY_QUEUE);
    if (!raw) return;
    let list = [];
    try { list = JSON.parse(raw); } catch (e) { list = []; }

    list.forEach(cmd => {
      this.applyCommand(cmd);
    });

    // uygulandı, kuyruğu temizle
    localStorage.removeItem(this.KEY_QUEUE);
  },
  applyCommand(cmd) {
    // örnek komut: {type:"feature", name:"ads", value:true}
    console.log("[InflowAI Updating] Komut alındı:", cmd);
    if (cmd.type === "feature" && window.servicesConfig) {
      // services özelliğini aç/kapat
      if (cmd.name === "ads") {
        window.servicesConfig.ads.enabled = !!cmd.value;
      }
      if (cmd.name === "paytr") {
        window.servicesConfig.paytr.enabled = !!cmd.value;
      }
    }
    if (cmd.type === "package" && window.inflowPackages) {
      if (window.inflowPackages[cmd.name]) {
        window.inflowPackages[cmd.name].active = !!cmd.value;
      }
    }
  },
  queueCommand(cmd) {
    const raw = localStorage.getItem(this.KEY_QUEUE) || "[]";
    let list = [];
    try { list = JSON.parse(raw); } catch (e) { list = []; }
    list.push(cmd);
    localStorage.setItem(this.KEY_QUEUE, JSON.stringify(list));
  }
};

document.addEventListener("DOMContentLoaded", () => {
  InflowUpdater.applyQueued();
});
