// ===========================
// InflowAI Katman 3: MODULES SERVICE
// ===========================
// Eğlence ve içerik üretim modüllerinin temel altyapısı.

if (typeof servicesConfig !== "undefined") {
  const { modules } = servicesConfig;

  const moduleList = [];

  if (modules.aiWriter) moduleList.push("AI İçerik Üretimi");
  if (modules.aiImage) moduleList.push("AI Görsel Üretimi");
  if (modules.aiFun) moduleList.push("Eğlence Modülü (Fal/Test)");

  if (moduleList.length > 0) {
    console.log(`[InflowAI Modules] Aktif modüller: ${moduleList.join(", ")}`);
  } else {
    console.log("[InflowAI Modules] Hiçbir modül aktif değil.");
  }
} else {
  console.error("[InflowAI Modules] servicesConfig bulunamadı!");
}
