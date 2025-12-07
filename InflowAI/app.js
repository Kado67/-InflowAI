// app.js — Ortak yardımcı fonksiyonlar

const API = "https://inflowai-api.onrender.com/api";

// Token görüntüleme
function getToken() {
  return localStorage.getItem("token");
}

// Kullanıcı bilgisi
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
}

// Giriş kontrolü
function requireLogin() {
  const token = getToken();
  if (!token) {
    alert("Bu işlemi yapmak için giriş yapmalısınız.");
    window.location.href = "hesabim.html";
  }
}

// Çıkış
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "hesabim.html";
}

// Basit istek fonksiyonu
async function apiGet(url) {
  const res = await fetch(API + url, {
    headers: { Authorization: "Bearer " + getToken() }
  });
  return res.json();
}

async function apiPost(url, body) {
  const res = await fetch(API + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}
