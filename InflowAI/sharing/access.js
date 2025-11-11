// ===========================
// InflowAI - Sharing / Access
// Giriş / kayıt / misafir mi?
// app.js ile aynı localStorage anahtarlarını kullanır.
// ===========================

const INFLOW_REGISTER_KEY = "inflow_registered";

const Access = {
  isRegistered() {
    return localStorage.getItem(INFLOW_REGISTER_KEY) === "1";
  },

  register() {
    localStorage.setItem(INFLOW_REGISTER_KEY, "1");
    console.log("[InflowAI Access] Kullanıcı kayıtlı olarak işaretlendi.");
  },

  logout() {
    localStorage.removeItem(INFLOW_REGISTER_KEY);
    console.log("[InflowAI Access] Kullanıcı çıkış yaptı.");
  }
};

// index.html’deki modal ile bağlanmak istersek:
document.addEventListener("DOMContentLoaded", () => {
  const btns = document.querySelectorAll("#fakeRegister");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      Access.register();
    });
  });
});
