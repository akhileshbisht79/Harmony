// =============================================
// HARMONY — Landing Page Scripts
// =============================================

// --- Hamburger Menu Toggle ---

const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const hamburgerIcon = hamburger?.querySelector("i");

hamburger?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("open");
    if (mobileMenu?.classList.contains("open")) {
        hamburgerIcon.className = "fa-solid fa-xmark";
    } else {
        hamburgerIcon.className = "fa-solid fa-bars";
    }
});

// Close mobile menu on link click

document.querySelectorAll(".mobile-nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        mobileMenu?.classList.remove("open");
        if (hamburgerIcon) hamburgerIcon.className = "fa-solid fa-bars";
    });
});

// Close mobile menu on window resize above 992px

window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
        mobileMenu?.classList.remove("open");
        if (hamburgerIcon) hamburgerIcon.className = "fa-solid fa-bars";
    }
});

// --- Redirect Handlers ---

document.querySelector(".login-btn")?.addEventListener("click", () => {
    window.location.href = "login.html";
});

document.querySelector(".mobile-login-btn")?.addEventListener("click", () => {
    window.location.href = "login.html";
});

document.querySelectorAll(".primary-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        window.location.href = "login.html";
    });
});

document.querySelectorAll(".secondary-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        window.location.href = "login.html";
    });
});

document.querySelectorAll(".btn-primary, .btn-ghost").forEach(btn => {
    btn.addEventListener("click", () => {
        window.location.href = "login.html";
    });
});

// --- FAQ Accordion ---

document.querySelectorAll(".faq-item").forEach(item => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    q.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        document.querySelectorAll(".faq-item").forEach(i => {
            i.classList.remove("open");
            i.querySelector(".faq-a").style.maxHeight = null;
        });
        if (!isOpen) {
            item.classList.add("open");
            a.style.maxHeight = a.scrollHeight + "px";
        }
    });
});

// --- Reveal on scroll (entire page) — smooth fade-up ---

const revealEls = [...document.querySelectorAll(
    ".hero-copy, .hero-visual, .section-head, .feature-box, " +
    ".developer-image, .developer-info, " +
    ".faq-item, .cta-panel, .footer-inner"
)];

// Fallback: if the user has reduced-motion enabled, show everything instantly
const okToAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!okToAnimate || !("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.add("visible"));
} else {
    revealEls.forEach((el, i) => {
        el.style.setProperty("--d", `${(i % 5) * 130}ms`);
        el.classList.add("reveal");
    });

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18 });

    revealEls.forEach(el => io.observe(el));
}

// --- Nav background on scroll ---

const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
if (navbar) {
        navbar.style.background = window.scrollY > 24
            ? "rgba(255, 255, 255, 0.9)"
            : "";
        navbar.style.boxShadow = window.scrollY > 24
            ? "0 14px 40px rgba(45, 95, 210, 0.12)"
            : "";
    }
}, { passive: true });

// --- Email (Mailto) Handler ---

document.querySelector('.social-links a[href^="mailto:"]')?.addEventListener("click", (e) => {
    // Let the default mailto: behavior handle it (opens system default email app)
});

// =============================================
// HARMONY — Hero Motion Graphics
// =============================================

(function () {

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    if (reducedMotion) return;

    // 1 · Staggered reveal delay for cascading sections
    const cascadeTargets = document.querySelectorAll(".feature-box, .faq-item");
    cascadeTargets.forEach((el, i) => {
        el.style.setProperty("--d", `${(i % 4) * 90}ms`);
    });

    if (!finePointer) return; // pointer-only interactions below

    // 3 · Soft brass cursor glow
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);

    let gx = innerWidth / 2;
    let gy = innerHeight / 2;
    let targetX = gx;
    let targetY = gy;
    let gliding = false;

    window.addEventListener("mousemove", (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!gliding) {
            gx = targetX;
            gy = targetY;
            glow.classList.add("on");
            gliding = true;
            requestAnimationFrame(glide);
        }
    }, { passive: true });

    function glide() {
        const dx = targetX - gx;
        const dy = targetY - gy;
        gx += dx * 0.14;
        gy += dy * 0.14;
        glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            requestAnimationFrame(glide);
        } else {
            gliding = false;
        }
    }

    window.addEventListener("mouseleave", () => glow.classList.remove("on"), { passive: true });

    // 3 · Magnetic hero CTA buttons
    document.querySelectorAll(".hero-cta .btn").forEach(btn => {
        btn.addEventListener("mousemove", (e) => {
            const r = btn.getBoundingClientRect();
            const x = (e.clientX - (r.left + r.width / 2)) / r.width;
            const y = (e.clientY - (r.top + r.height / 2)) / r.height;
            btn.style.transform = `translate(${x * 9}px, ${y * 9}px)`;
        });
        btn.addEventListener("mouseleave", () => {
            btn.style.transform = "";
        });
    });

    // 5 · 3D tilt on feature cards
    document.querySelectorAll(".feature-box").forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform =
                `perspective(760px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-4px)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });

})();

// --- Vinyl scroll parallax ---

(function () {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vinyl = document.querySelector(".vinyl");

    if (reducedMotion || !vinyl) return;

    let pending = false;

    const update = () => {
        pending = false;
        const hero = document.querySelector(".hero");
        if (!hero) return;
        const rect = hero.getBoundingClientRect();
        const start = window.innerHeight * 0.9;
        const travel = hero.offsetHeight + window.innerHeight;
        const progress = Math.max(0, Math.min(1, (start - rect.top) / travel));
        vinyl.style.transform = `translateY(${(progress * -42).toFixed(1)}px)`;
    };

    const onScroll = () => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
})();