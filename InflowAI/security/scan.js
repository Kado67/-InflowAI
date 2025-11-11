// security/scan.js
// InflowAI - Security - Scan (algılama)
// Passif, yalnızca tespit amaçlı. Bir saldırı veya anormallik tespit edilirse
// CustomEvent ile diğer güvenlik modüllerine sinyal gönderir.

(function () {
  const SCAN = {
    clickWindow: { lastTime: 0, count: 0 },
    lastConsoleErrors: 0,
    suspiciousPatterns: [/</, /script/i, /onerror/i, /<\s*script/i],
    threshold: {
      rapidClickCount: 8,           // kısa zamanda bu kadar click = şüphe
      clickWindowMs: 1500,         // zaman penceresi
      consoleErrorsDelta: 3        // kısa sürede hata artışı
    },
    start() {
      this.hookWindowError();
      this.hookConsoleError();
      this.hookClicks();
      this.hookInputs();
      console.log("[InflowAI Scan] Güvenlik tarayıcı modülü başlatıldı.");
    },
    hookWindowError() {
      window.addEventListener("error", (ev) => {
        const payload = {
          type: "window.error",
          message: ev.message,
          filename: ev.filename,
          lineno: ev.lineno,
          colno: ev.colno,
          stack: ev.error && ev.error.stack
        };
        this.report("error", payload);
      });
      // unhandledrejection
      window.addEventListener("unhandledrejection", (ev) => {
        const payload = { type: "unhandledrejection", reason: ev.reason };
        this.report("error", payload);
      });
    },
    hookConsoleError() {
      const orig = console.error.bind(console);
      console.error = (...args) => {
        orig(...args);
        this.lastConsoleErrors++;
        this.report("console.error", { args });
      };
      // Periodic check: if console errors rapidly increase, report
      setInterval(() => {
        if (this.lastConsoleErrors >= this.threshold.consoleErrorsDelta) {
          this.report("console.spike", { count: this.lastConsoleErrors });
        }
        this.lastConsoleErrors = 0;
      }, 2000);
    },
    hookClicks() {
      document.addEventListener("click", (e) => {
        const now = Date.now();
        if (now - this.clickWindow.lastTime <= this.threshold.clickWindowMs) {
          this.clickWindow.count++;
        } else {
          this.clickWindow.count = 1;
        }
        this.clickWindow.lastTime = now;

        if (this.clickWindow.count >= this.threshold.rapidClickCount) {
          this.report("rapid.clicks", {
            count: this.clickWindow.count,
            timeWindow: this.threshold.clickWindowMs
          });
          // reset counter to avoid spam reports
          this.clickWindow.count = 0;
        }
      }, { passive: true });
    },
    hookInputs() {
      // dinamik olarak form inputlarını tarar: inline script tag araması vb.
      document.addEventListener("input", (e) => {
        try {
          const v = (e.target && (e.target.value || e.target.textContent) || "").toString();
          if (!v) return;
          for (const re of this.suspiciousPatterns) {
            if (re.test(v)) {
              this.report("suspicious.input", { sample: v.slice(0, 200) });
              break;
            }
          }
        } catch (err) {
          // ignore
        }
      }, true);
    },
    report(name, payload) {
      const eventDetail = { name, payload, time: new Date().toISOString() };
      console.warn("[InflowAI Scan] Tespit:", name, payload);
      // dispatch event for defense & alert modules
      try {
        window.dispatchEvent(new CustomEvent("inflow:security:detected", { detail: eventDetail }));
      } catch (err) {
        console.error("dispatch error", err);
      }
    }
  };

  // başlat
  document.addEventListener("DOMContentLoaded", () => SCAN.start());
  // export for manual calls
  window.InflowSecurityScan = SCAN;
})();
