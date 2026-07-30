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

document.querySelector(".secondary-btn")?.addEventListener("click", () => {
    window.location.href = "login.html";
});

// --- Email (Mailto) Handler ---

document.querySelector('.social-links a[href^="mailto:"]')?.addEventListener("click", (e) => {
    // Let the default mailto: behavior handle it (opens system default email app)
});
