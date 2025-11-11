const InflowAI = {
  version: "1.0.0",
  modules: [],
  status: {
    activeUsers: 0,
    platform: "free",
    uptime: new Date().toLocaleString()
  },
  log(msg) {
    console.log(`[InflowAI] ${msg}`);
  },
  updateStatus(key, val) {
    this.status[key] = val;
    this.syncToVercel();
  },
  registerModule(name, fn) {
    this.modules.push({ name, fn });
    this.log(`Modül eklendi: ${name}`);
  }
};

// Kullanıcı sayısını simüle et
InflowAI.registerModule("UserStats", () => {
  setInterval(() => {
    const users = Math.floor(Math.random() * 1000) + 120;
    InflowAI.updateStatus("activeUsers", users);
  }, 3000);
});

// Paketleri sırayla değiştir
InflowAI.registerModule("PackageMonitor", () => {
  const packages = ["Ücretsiz", "Premium", "Kurumsal", "B2B"];
  let i = 0;
  setInterval(() => {
    InflowAI.updateStatus("platform", packages[i]);
    i = (i + 1) % packages.length;
  }, 10000);
});

async function vercelSenkronizeEt() {
  try {
    const yanit = await fetch(
      "https://api.vercel.com/v1/integrations/deploy/prj_inflow-ai-vmat",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer YOUR_VERCEL_TOKEN",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reason: "Kontrol Merkezi Senkronu",
          time: new Date().toISOString(),
          data: InflowAI.status
        })
      }
    );
    if (yanit.ok) {
      console.log("✅ Vercel yayını senkronize edildi!");
    } else {
      console.error("❌ Senkron hata:", yanit.statusText);
    }
  } catch (err) {
    console.error("⚠️ Ağ hatası:", err.message);
  }
}
// --- InflowAI Vercel Sync Monitor ---
async function checkVercelStatus() {
  const statusEl = document.createElement('div');
  statusEl.id = 'vercel-status';
  statusEl.style.position = 'fixed';
  statusEl.style.bottom = '10px';
  statusEl.style.right = '15px';
  statusEl.style.padding = '8px 14px';
  statusEl.style.borderRadius = '8px';
  statusEl.style.fontSize = '13px';
  statusEl.style.background = '#121212';
  statusEl.style.color = '#00ff95';
  statusEl.style.fontFamily = 'monospace';
  statusEl.innerText = '🔄 InflowAI Vercel Sync aktif...';
  document.body.appendChild(statusEl);

  try {
    const res = await fetch('https://inflow-ai-vmat.vercel.app/api/health');
    if (res.ok) {
      statusEl.innerText = '✅ Vercel senkron: Aktif';
      statusEl.style.color = '#00ff95';
    } else {
      statusEl.innerText = '⚠️ Senkron hatası algılandı';
      statusEl.style.color = '#ff5050';
    }
  } catch (err) {
    statusEl.innerText = '❌ Bağlantı yok';
    statusEl.style.color = '#ff5050';
  }
}

window.addEventListener('load', checkVercelStatus);
InflowAI.syncToVercel = vercelSenkronizeEt;
window.addEventListener("storage", vercelSenkronizeEt);
InflowAI.log("Core motor başlatıldı 🚀");
vercelSenkronizeEt();
Add core app.js file (Vercel sync)
