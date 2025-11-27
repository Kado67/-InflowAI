// ===============================================
// InflowAI - Yaşayan Platform Arayüz Motoru
// Avatar animasyonları + diyalog sistemi
// ===============================================

document.addEventListener("DOMContentLoaded", () => {

    const avatar = document.getElementById("inflowAvatar");
    const dialog = document.getElementById("avatarDialog");
    const input = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const btnStart = document.getElementById("btnStart");
    const btnTour = document.getElementById("btnTour");

    // -----------------------------
    // 1) Avatar'a mini canlılık efekti
    // -----------------------------

    function avatarPulse() {
        avatar.style.transition = "0.3s";
        avatar.style.transform = "scale(1.05)";
        setTimeout(() => {
            avatar.style.transform = "scale(1)";
        }, 300);
    }

    function avatarShake() {
        avatar.animate(
            [
                { transform: "translateX(0)" },
                { transform: "translateX(-6px)" },
                { transform: "translateX(6px)" },
                { transform: "translateX(0)" }
            ],
            { duration: 300 }
        );
    }

    function avatarDance() {
        avatar.animate(
            [
                { transform: "rotate(-4deg) scale(1.04)" },
                { transform: "rotate(4deg) scale(1.07)" },
                { transform: "rotate(-4deg) scale(1.04)" }
            ],
            { duration: 700 }
        );
    }

    // -----------------------------
    // 2) Avatar konuşma fonksiyonu
    // -----------------------------

    function speak(text) {
        dialog.innerHTML = text;
        avatarPulse();
    }

    // -----------------------------
    // 3) Otomatik mini animasyon döngüsü
    // -----------------------------

    const randomMoves = [
        () => speak("Buradayım kurban 😄 Hazır bekliyorum."),
        () => speak("Hadi bir şey yaz, ben buradayım 💜"),
        () => { speak("Kendimi güncelliyorum... 🧠✨"); avatarShake(); },
        () => { speak("Dans modunu açıyorum 💃😎"); avatarDance(); }
    ];

    setInterval(() => {
        const move = randomMoves[Math.floor(Math.random() * randomMoves.length)];
        move();
    }, 14000);

    // -----------------------------
    // 4) Kullanıcı mesaj gönderdiğinde
    // -----------------------------

    function handleUserMessage() {
        const msg = input.value.trim();
        if (!msg) {
            avatarShake();
            speak("Boş gönderme kurban 😊 Bir şey yaz ki konuşalım.");
            return;
        }

        speak(`"${msg}" alındı! Şimdi bunu işliyorum… ⚡`);
        avatarDance();

        input.value = "";

        setTimeout(() => {
            speak("Hazır! İstersen bu fikri içerik olarak büyütebilirim. 🚀");
        }, 2500);
    }

    sendBtn?.addEventListener("click", handleUserMessage);

    input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleUserMessage();
    });

    // -----------------------------
    // 5) Buton: "Hemen içerik üret"
    // -----------------------------

    btnStart?.addEventListener("click", () => {
        avatarDance();
        speak("Tamam kurban! İçerik üretmek için bana bir cümle yaz. ✍️");
        input.focus();
    });

    // -----------------------------
    // 6) Buton: "Platformu bana anlat"
    // -----------------------------

    btnTour?.addEventListener("click", () => {
        avatarPulse();
        speak(`
            InflowAI 7 katmanlı yaşayan bir platformdur.<br>
            • İçerik üretir<br>
            • Eğlendirir<br>
            • Ziyaretçiyi tutar<br>
            • B2B paneli şu an ücretsiz<br>
            • Premium & Kurumsal yakında<br><br>
            Ne istersen beraber yaparız kurban. 💜
        `);
    });

    // -----------------------------
    // 7) Hızlı Kartlar (mini router)
    // -----------------------------

    document.querySelectorAll(".btn-mini").forEach((btn) => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.target;

            if (target === "content") {
                speak("Tamamdır! İçerik üretmek için bir cümle yaz bana. ✍️🚀");
                avatarPulse();
                input.focus();
            }

            if (target === "fun") {
                speak("Eğlence alanı açık! Kahve falı, burç, tarot, mini testler… Hepsi aktif 😄");
                avatarDance();
            }

            if (target === "b2b") {
                speak("B2B paneli şuan ücretsiz! İşletmeler için içerik takvimi ve AI şablonlar aktif. 🏢⚡");
                avatarPulse();
            }
        });
    });

});
