// app.js – Ortak yardımcı fonksiyonlar
const API = "https://inflowai-api.onrender.com/api";

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

// 👇 ALERT YOK: direkt Hesabım sayfasına, query ile yolluyoruz
function requireLogin() {
  if (!getToken()) {
    window.location.href = "hesabim.html?msg=login-required";
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "hesabim.html";
}
