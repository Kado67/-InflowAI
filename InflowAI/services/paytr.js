// ===========================
// InflowAI Katman 3: PAYTR SERVICE
// ===========================
// PayTR ödeme sistemi entegrasyonu (hazırlık aşaması)
// Şu anda sadece yapı doğrulaması yapıyor.

if (typeof servicesConfig !== "undefined") {
  const { paytr } = servicesConfig;

  if (paytr.enabled) {
    console.log("[InflowAI PayTR] Ödeme sistemi aktif.");
    console.log(`Merchant ID: ${paytr.merchantId}`);
  } else {
    console.log("[InflowAI PayTR] Ödeme sistemi şu an devre dışı.");
  }
} else {
  console.error("[InflowAI PayTR] servicesConfig bulunamadı!");
}
