// --- Elements ---

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const toast = document.getElementById("toast");

// --- Toast ---

function showToast(message, color = "#1DB954") {
    toast.innerText = message;
    toast.style.background = color;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// --- Toggle Forms ---

loginTab.addEventListener("click", () => {
    loginForm.style.display = "flex";
    signupForm.style.display = "none";
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
});

signupTab.addEventListener("click", () => {
    signupForm.style.display = "flex";
    loginForm.style.display = "none";
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
});

// --- Signup ---

signupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("confirmPassword").value;
    if (password !== confirm) {
        showToast("Passwords do not match", "red");
        return;
    }
    const user = { username, email, password };
    localStorage.setItem("user", JSON.stringify(user));
    showToast("Signup Successful!");
    signupForm.reset();
    loginTab.click();
});

// --- Login ---

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
        showToast("No account found. Please Signup.", "red");
        return;
    }
    if (email === storedUser.email && password === storedUser.password) {
        showToast("Login Successful!");
        localStorage.setItem("loggedIn", "true");
        setTimeout(() => {
            window.location.href = "home.html";
        }, 1200);
    } else {
        showToast("Invalid Email or Password", "red");
    }
});

// --- Password Toggle ---

document.querySelectorAll(".toggle-password").forEach(toggle => {
    toggle.addEventListener("click", () => {
        const input = toggle.previousElementSibling;
        if (input.type === "password") {
            input.type = "text";
            toggle.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
        } else {
            input.type = "password";
            toggle.innerHTML = '<i class="fa-solid fa-eye"></i>';
        }
    });
});
