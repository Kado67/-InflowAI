// app.js – Ortak yardımcı fonksiyonlar
const API = "https://inflowai-api.onrender.com/api";

function getToken() {
  return localStorage.getItem("token");
}
function getUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
}
function requireLogin() {
  if (!getToken()) {
    alert("Bu işlem için giriş yapmalısınız.");
    window.location.href = "hesabim.html";
  }
}
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "hesabim.html";
}
