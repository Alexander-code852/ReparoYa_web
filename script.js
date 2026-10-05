document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- MÚSICA ---
    const musicBtn = document.getElementById("music-btn");
    const bgMusic = document.getElementById("bg-music");

    const setPlaying = (playing) => {
        musicBtn.classList.toggle("is-playing", playing);
        musicBtn.setAttribute("aria-pressed", String(playing));
        musicBtn.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
    };

    const playMusic = () => {
        bgMusic.volume = 0.6;
        bgMusic.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };

    musicBtn.addEventListener("click", () => {
        if (bgMusic.paused) {
            playMusic();
        } else {
            bgMusic.pause();
            setPlaying(false);
        }
    });

    // --- SOBRE DE APERTURA (abre la invitación y arranca la música) ---
    const envelope = document.getElementById("envelope");
    const openBtn = document.getElementById("open-btn");

    openBtn.addEventListener("click", () => {
        playMusic();
        // 1) se rompe el sello y se abre la solapa, 2) sale la carta, 3) se desvanece el sobre
        envelope.classList.add("is-opening");
        const wait = reduceMotion ? 0 : 1700;
        setTimeout(() => {
            envelope.classList.add("is-open");
            body.classList.remove("is-locked");
            setTimeout(() => envelope.remove(), 1000);
        }, wait);
    }, { once: true });

    // --- ANIMACIONES AL DESLIZAR ---
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

    // --- BARRA FLOTANTE: visible después de la portada, oculta en la sección de confirmación ---
    const stickyCta = document.getElementById("sticky-cta");
    const stickyLink = stickyCta.querySelector("a");
    const hero = document.getElementById("inicio");
    const rsvp = document.getElementById("confirmar");
    let heroVisible = true;
    let rsvpVisible = false;

    const updateSticky = () => {
        const show = !heroVisible && !rsvpVisible;
        stickyCta.classList.toggle("is-visible", show);
        stickyCta.setAttribute("aria-hidden", String(!show));
        stickyLink.tabIndex = show ? 0 : -1;
    };

    new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        updateSticky();
    }, { threshold: 0.35 }).observe(hero);

    new IntersectionObserver(([entry]) => {
        rsvpVisible = entry.isIntersecting;
        updateSticky();
    }, { threshold: 0.2 }).observe(rsvp);

    // --- COPIAR ALIAS ---
    const toast = document.getElementById("toast");
    let toastTimer;

    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add("is-visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
    };

    document.querySelectorAll(".alias").forEach((copyBtn) => {
        const action = copyBtn.querySelector(".alias-action");
        let resetTimer;

        copyBtn.addEventListener("click", async () => {
            const alias = copyBtn.dataset.alias;
            try {
                await navigator.clipboard.writeText(alias);
            } catch {
                // Alternativa para navegadores sin acceso al portapapeles
                const temp = document.createElement("textarea");
                temp.value = alias;
                temp.setAttribute("readonly", "");
                temp.style.position = "absolute";
                temp.style.left = "-9999px";
                document.body.appendChild(temp);
                temp.select();
                document.execCommand("copy");
                temp.remove();
            }
            copyBtn.classList.add("is-copied");
            action.innerHTML = '<i class="fa-solid fa-check"></i> Copiado';
            showToast(`Alias "${alias}" copiado ✨`);
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => {
                copyBtn.classList.remove("is-copied");
                action.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar';
            }, 2500);
        });
    });

    // --- CUENTA REGRESIVA (hora de Argentina) ---
    const eventDate = new Date("2026-10-31T21:15:00-03:00").getTime();
    const els = {
        days: document.getElementById("days"),
        hours: document.getElementById("hours"),
        minutes: document.getElementById("minutes"),
        seconds: document.getElementById("seconds"),
    };
    const pad = (n) => String(n).padStart(2, "0");

    const tick = () => {
        const distance = eventDate - Date.now();

        if (distance <= 0) {
            clearInterval(timer);
            document.getElementById("countdown").innerHTML =
                '<p class="countdown-done">¡Hoy es el gran día!</p>';
            return;
        }

        els.days.textContent = pad(Math.floor(distance / 86400000));
        els.hours.textContent = pad(Math.floor((distance % 86400000) / 3600000));
        els.minutes.textContent = pad(Math.floor((distance % 3600000) / 60000));
        els.seconds.textContent = pad(Math.floor((distance % 60000) / 1000));
    };

    const timer = setInterval(tick, 1000);
    tick();

    // --- LINTERNAS FLOTANTES ---
    const sky = document.getElementById("lanterns");
    if (sky && !reduceMotion) {
        const count = window.innerWidth < 768 ? 16 : 26;
        for (let i = 0; i < count; i++) {
            const lantern = document.createElement("span");
            const depth = Math.random();                 // 0 = lejos, 1 = cerca
            lantern.className = depth < 0.4 ? "lantern far" : "lantern";
            lantern.style.left = `${Math.random() * 96}%`;
            lantern.style.setProperty("--size", `${(10 + depth * 18).toFixed(1)}px`);
            lantern.style.setProperty("--alpha", (0.45 + depth * 0.5).toFixed(2));
            lantern.style.setProperty("--dur", `${(34 - depth * 14).toFixed(1)}s`);
            lantern.style.setProperty("--delay", `${(-Math.random() * 34).toFixed(1)}s`);
            lantern.style.setProperty("--sway", `${(Math.random() * 24 + 6).toFixed(0)}px`);
            sky.appendChild(lantern);
        }
    }
});
