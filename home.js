// --- DOM ELEMENTS ---

const searchInput = document.getElementById("searchInput");
const songContainer = document.getElementById("songContainer");
const trendingSongs = document.getElementById("trendingSongs");
const recentContainer = document.getElementById("recentContainer");
const username = document.getElementById("username");
const heroUser = document.getElementById("heroUser");
const heroGreeting = document.getElementById("heroGreeting");
const playerImage = document.getElementById("playerImage");
const playerSong = document.getElementById("playerSong");
const playerArtist = document.getElementById("playerArtist");
const audioPlayer = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");
const toast = document.getElementById("toast");
const loader = document.getElementById("loader");
const logoutBtn = document.getElementById("logoutBtn");

// --- VARIABLES ---

let currentSongs = [];
let currentIndex = 0;
let recentSongs = JSON.parse(localStorage.getItem("recentSongs")) || [];
let currentPlaylist = [];
let currentContainerId = "songContainer";
let isPlaying = false;
let timer;

// --- LOGIN CHECK ---

if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}

// --- TIME-BASED GREETING ---

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
        return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
        return "Good Evening";
    } else {
        return "Good Night";
    }
}

// --- LOAD USER ---

const user = JSON.parse(localStorage.getItem("user"));
if (user) {
    username.textContent = `Hi, ${user.username}`;
    heroUser.textContent = user.username;
    heroGreeting.textContent = getGreeting();
}

// --- TOAST ---

function showToast(message, color = "#1DB954") {
    toast.innerText = message;
    toast.style.background = color;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// --- LOADER ---

function showLoader() {
    loader.classList.add("active");
}

function hideLoader() {
    loader.classList.remove("active");
}

// --- LOGOUT ---

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
});

// --- SIDEBAR NAVIGATION ---

const sidebarLinks = document.querySelectorAll(".sidebar ul li");
sidebarLinks.forEach(link => {
    link.addEventListener("click", () => {
        sidebarLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");
        const targetId = link.getAttribute("data-target");
        if (targetId === "page-top") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            const target = document.getElementById(targetId);
            if (target) {
                // Scroll to parent section for proper positioning
                const section = target.closest(".songs-section");
                if (section) {
                    section.scrollIntoView({ behavior: "smooth", block: "start" });
                } else {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
        }
    });
});

// --- SEARCH API ---

async function searchSongs(query) {
    if (query.trim() === "") {
        songContainer.innerHTML = "";
        return;
    }
    showLoader();
    try {
        const response = await fetch(
            `https://itunes.apple.com/search?term=${query}&entity=song&limit=30`
        );
        const data = await response.json();
        currentSongs = data.results;
        renderSongs(currentSongs, songContainer);
        // Auto-scroll to Search Results section
        const searchSection = document.querySelector(".songs-section");
        if (searchSection) {
            searchSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    } catch (error) {
        console.log(error);
        showToast("Unable to fetch songs", "red");
    }
    hideLoader();
}

// --- SEARCH EVENT (Manual - Only on Enter or Button Click) ---

document.getElementById("searchBtn").addEventListener("click", () => {
    searchSongs(searchInput.value);
});

// --- TRENDING SONGS (Indian Trends - Real Variety) ---

const indianTrendingTerms = [
    "arijit singh", "diljit dosanjh", "atif aslam", "nehha kakkar",
    "badshah", "divine", "AP Dhillon", "sidhu moose wala",
    "bollywood hits 2024", "punjabi hits", "hindi pop", "lofi",
    "karan aujla", "jubin nautiyal", "shreya ghoshal", "arijit singh hits",
    "bollywood dance", "t-series hits", "b Praak", "darshan raval"
];

async function loadTrending() {
    showLoader();
    try {
        // Pick 3 random search terms for variety
        const shuffled = [...indianTrendingTerms].sort(() => Math.random() - 0.5);
        const selectedTerms = shuffled.slice(0, 3);

        const allResults = [];
        for (const term of selectedTerms) {
            const response = await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=10&country=IN`
            );
            const data = await response.json();
            if (data.results) allResults.push(...data.results);
        }

        // Remove duplicates by trackId
        const seen = new Set();
        const unique = allResults.filter(song => {
            if (seen.has(song.trackId)) return false;
            seen.add(song.trackId);
            return true;
        });

        // Shuffle for mixed order
        const finalSongs = unique.sort(() => Math.random() - 0.5).slice(0, 20);
        window.trendingData = finalSongs;
        renderSongs(window.trendingData, trendingSongs);
    } catch (err) {
        console.log(err);
        showToast("Unable to load trending", "red");
    }
    hideLoader();
}

// --- RENDER SONGS ---

function renderSongs(songs, container) {
    container.innerHTML = "";
    if (!songs || songs.length === 0) {
        container.innerHTML = `
            <div class="empty">
                No Songs Found 🎵
            </div>
        `;
        return;
    }
    songs.forEach((song, index) => {
        const card = document.createElement("div");
        card.className = "song-card";
        card.innerHTML = `
            <img
                src="${song.artworkUrl100.replace("100x100", "500x500")}"
                alt="${song.trackName}">
            <button
                class="play-btn"
                onclick="playSong(${index}, '${container.id}')">
                <i class="fa-solid fa-play"></i>
            </button>
            <div class="song-info">
                <h3>${song.trackName}</h3>
                <p>${song.artistName}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- GET SONG ARRAY ---

function getSongArray(containerId) {
    switch (containerId) {
        case "songContainer":
            return currentSongs;
        case "trendingSongs":
            return Array.from(trendingSongs.children)
                .map((_, i) => window.trendingData[i]);
        case "recentContainer":
            return recentSongs;
        default:
            return currentSongs;
    }
}

// --- INITIAL EMPTY STATE FOR RECENT ---

if (recentSongs.length === 0) {
    recentContainer.innerHTML =
        `<div class="empty">
        Recently Played Songs Will Appear Here
    </div>`;
}

// --- PLAY SONG ---

function playSong(index, containerId) {
    currentPlaylist = getSongArray(containerId);
    currentContainerId = containerId;
    currentIndex = index;
    const song = currentPlaylist[currentIndex];
    if (!song.previewUrl) {
        showToast("Preview not available", "red");
        return;
    }
    audioPlayer.src = song.previewUrl;
    playerImage.src = song.artworkUrl100.replace("100x100", "500x500");
    playerSong.textContent = song.trackName;
    playerArtist.textContent = song.artistName;
    audioPlayer.play();
    isPlaying = true;
    playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    playBtn.classList.add("playing");
    document.querySelector(".hero-image i").classList.add("playing");
    addRecent(song);
}

// --- PLAY / PAUSE ---

playBtn.addEventListener("click", () => {
    if (!audioPlayer.src) return;
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
        playBtn.classList.remove("playing");
        document.querySelector(".hero-image i").classList.remove("playing");
    } else {
        audioPlayer.play();
        isPlaying = true;
        playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        playBtn.classList.add("playing");
        document.querySelector(".hero-image i").classList.add("playing");
    }
});

// --- NEXT / PREV ---

nextBtn.addEventListener("click", () => {
    if (currentPlaylist.length === 0) return;
    currentIndex++;
    if (currentIndex >= currentPlaylist.length) currentIndex = 0;
    playSong(currentIndex, currentContainerId);
});

prevBtn.addEventListener("click", () => {
    if (currentPlaylist.length === 0) return;
    currentIndex--;
    if (currentIndex < 0) currentIndex = currentPlaylist.length - 1;
    playSong(currentIndex, currentContainerId);
});

// --- AUTO NEXT ---

audioPlayer.addEventListener("ended", () => {
    nextBtn.click();
});

// --- PROGRESS BAR ---

audioPlayer.addEventListener("timeupdate", () => {
    if (audioPlayer.duration) {
        progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    }
});

// --- SEEK ---

progressBar.addEventListener("input", () => {
    if (audioPlayer.duration) {
        audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
    }
});

// --- VOLUME ---

volumeBar.addEventListener("input", () => {
    audioPlayer.volume = volumeBar.value;
});

// --- SPACEBAR PLAY/PAUSE ---

document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && document.activeElement !== searchInput) {
        e.preventDefault();
        playBtn.click();
    }
});

// --- DOUBLE CLICK CARD ---

document.addEventListener("dblclick", (e) => {
    const card = e.target.closest(".song-card");
    if (!card) return;
    const cards = [...card.parentNode.children];
    const index = cards.indexOf(card);
    playSong(index, card.parentNode.id);
});

// --- PLAYER IMAGE FALLBACK ---

playerImage.onerror = function () {
    this.src = "https://placehold.co/300x300/181818/1DB954?text=Harmony";
};

// --- AUDIO ERROR / READY ---

audioPlayer.addEventListener("error", () => {
    showToast("Unable to play preview", "red");
});

audioPlayer.addEventListener("canplay", () => {
    hideLoader();
});

// --- RECENTLY PLAYED ---

function addRecent(song) {
    recentSongs = recentSongs.filter(item => item.trackId !== song.trackId);
    recentSongs.unshift(song);
    if (recentSongs.length > 10) recentSongs.pop();
    localStorage.setItem("recentSongs", JSON.stringify(recentSongs));
    renderRecent();
}

function renderRecent() {
    recentContainer.innerHTML = "";
    if (recentSongs.length === 0) {
        recentContainer.innerHTML = `
            <div class="empty">
                No Recently Played Songs
            </div>
        `;
        return;
    }
    recentSongs.forEach((song, index) => {
        const card = document.createElement("div");
        card.className = "song-card";
        card.innerHTML = `
            <img src="${song.artworkUrl100.replace("100x100", "500x500")}">
            <button
                class="play-btn"
                onclick="playSong(${index},'recentContainer')">
                <i class="fa-solid fa-play"></i>
            </button>
            <div class="song-info">
                <h3>${song.trackName}</h3>
                <p>${song.artistName}</p>
            </div>
        `;
        recentContainer.appendChild(card);
    });
}

function clearRecent() {
    recentSongs = [];
    localStorage.removeItem("recentSongs");
    renderRecent();
    showToast("History Cleared");
}

// --- SAVE LAST PLAYED ---

audioPlayer.addEventListener("play", () => {
    if (currentPlaylist.length === 0) return;
    localStorage.setItem("lastSong", JSON.stringify(currentPlaylist[currentIndex]));
});

// --- DISCOVER BUTTON ---

document.getElementById("discoverBtn").addEventListener("click", () => {
    document.querySelector(".songs-section").scrollIntoView({
        behavior: "smooth"
    });
});

// --- SEARCH ENTER KEY ---

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchSongs(searchInput.value);
    }
});

// --- ESC CLEAR SEARCH ---

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        searchInput.value = "";
        songContainer.innerHTML = "";
    }
});

// --- CTRL + K SEARCH ---

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        searchInput.focus();
    }
});

// --- SAVE VOLUME ---

volumeBar.addEventListener("change", () => {
    localStorage.setItem("volume", volumeBar.value);
});

// --- RESTORE VOLUME ---

const savedVolume = localStorage.getItem("volume");
if (savedVolume) {
    audioPlayer.volume = savedVolume;
    volumeBar.value = savedVolume;
}

// --- ONLINE STATUS ---

window.addEventListener("offline", () => {
    showToast("Internet Connection Lost", "red");
});

window.addEventListener("online", () => {
    showToast("Connected", "#1DB954");
});

// --- IMAGE FALLBACK ---

document.addEventListener("error", (e) => {
    if (e.target.tagName === "IMG") {
        e.target.src = "https://placehold.co/300x300/181818/1DB954?text=Harmony";
    }
}, true);

// --- RESTORE LAST SONG ON LOAD ---

window.addEventListener("load", () => {
    const lastSong = JSON.parse(localStorage.getItem("lastSong"));
    if (!lastSong) return;
    playerImage.src = lastSong.artworkUrl100.replace("100x100", "500x500");
    playerSong.textContent = lastSong.trackName;
    playerArtist.textContent = lastSong.artistName;
});

// --- APP INITIALIZATION ---

function initializeApp() {
    loadTrending();
    renderRecent();
    audioPlayer.volume = 1;
    volumeBar.value = 1;
}

initializeApp();

// --- WELCOME MESSAGE ---

setTimeout(() => {
    if (user) showToast(`Welcome ${user.username} 🎵`);
}, 1000);

// --- CLICK ANIMATION ---

document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
        btn.style.transform = "scale(.95)";
        setTimeout(() => {
            btn.style.transform = "";
        }, 120);
    });
});

// --- CONSOLE MESSAGE ---

console.log("%cHarmony Music Player Loaded 🎵", "color:#1DB954;font-size:20px;font-weight:bold");

