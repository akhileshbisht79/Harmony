// =============================================
// HARMONY — Music Dashboard Scripts
// =============================================

// --- DOM ELEMENTS ---

const searchInput = document.getElementById("searchInput");
const songContainer = document.getElementById("songContainer");
const searchCount = document.getElementById("searchCount");
const suggestList = document.getElementById("suggestList");
const mainContent = document.querySelector(".main-content");
const searchView = document.getElementById("searchView");
const chartGrid = document.getElementById("chartGrid");
const chartPanelInline = document.getElementById("chartPanelInline");
const chartClose = document.getElementById("chartClose");
const chartList = document.getElementById("chartList");
const chartTitle = document.getElementById("chartTitle");
const chartSub = document.getElementById("chartSub");
const recentContainer = document.getElementById("recentContainer");
const username = document.getElementById("username");
const playerImage = document.getElementById("playerImage");
const playerSong = document.getElementById("playerSong");
const playerArtist = document.getElementById("playerArtist");
const audioPlayer = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");
const curTime = document.getElementById("curTime");
const durTime = document.getElementById("durTime");
const player = document.getElementById("player");
const toast = document.getElementById("toast");
const loader = document.getElementById("loader");
const logoutBtn = document.getElementById("logoutBtn");
const clearRecentBtn = document.getElementById("clearRecentBtn");

// --- VARIABLES ---

let currentSongs = [];
let currentIndex = 0;
let currentPlaylist = [];
let currentContainerId = "recentContainer";
let isPlaying = false;

// --- LOGIN CHECK ---

if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}

// --- CURRENT USER (per-user scoped data) ---

const currentUserEmail = localStorage.getItem("harmonySession") || "guest";
const userKey = (key) => `${currentUserEmail}:${key}`;

const allUsers = JSON.parse(localStorage.getItem("harmonyUsers")) || {};
const user = allUsers[currentUserEmail];

let recentSongs = JSON.parse(localStorage.getItem(userKey("recentSongs"))) || [];

// --- LOAD USER ---

if (user) {
    username.textContent = `Hi, ${user.username}`;
} else {
    username.textContent = `Hi, ${currentUserEmail}`;
}

// --- FORMAT TIME ---

function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

// --- RANGE FILL (progress bar gradient) ---

function updateRangeFill(range) {
    if (!range || !range.max) return;
    const pct = ((range.value - range.min) / (range.max - range.min)) * 100;
    range.style.setProperty("--fill", pct + "%");
}

// --- TOAST ---

function showToast(message, color = "#2563eb") {
    toast.innerText = message;
    toast.style.background = "#ffffff";
    toast.style.borderColor = color;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
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
    localStorage.removeItem("harmonySession");
    window.location.href = "index.html";
});

// --- VIEW SWITCHING (single-page search) ---

function showView(viewName) {
    if (viewName === "search") {
        mainContent.classList.add("search-mode");
        searchView.hidden = false;
    } else {
        mainContent.classList.remove("search-mode");
        searchView.hidden = true;
    }
}

// --- SIDEBAR NAVIGATION ---

const sidebarLinks = document.querySelectorAll(".sidebar ul li");
sidebarLinks.forEach(link => {
    link.addEventListener("click", () => {
        sidebarLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");
        const targetId = link.getAttribute("data-target");
        if (targetId === "search") {
            renderSuggestions();
            showView("search");
            searchInput.focus();
            return;
        }
        showView("home");
        if (targetId === "page-top") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            const target = document.getElementById(targetId);
            if (target) {
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

// --- SEARCH (in-page dedicated search view) ---

const suggestions = [
    "arijit singh",
    "bollywood hits",
    "punjabi hits",
    "lofi beats",
    "atif aslam",
    "hindi pop",
    "english hits",
    "heartbreak songs",
    "workout playlist",
    "retro bollywood",
    "the weeknd",
    "chill vibes"
];

function renderSuggestions() {
    if (!suggestList) return;
    suggestList.innerHTML = suggestions.map(s => `
        <button class="suggestion-chip" onclick="runSearch('${s.replace(/'/g, "\\'")}')">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            ${s}
        </button>
    `).join("");
}

const searchStorefronts = ["us", "in", "gb", "au", "de", "ca"];

async function fetchSearchStore(q, cc, limit) {
    try {
        const res = await fetch(
            `https://itunes.apple.com/${cc}/search?term=${encodeURIComponent(q)}&entity=song&limit=${limit}&country=${cc}`
        );
        const data = await res.json();
        return (data.results || []).filter(s => s.previewUrl);
    } catch (e) {
        return [];
    }
}

async function runSearch(query) {
    const q = (query || searchInput.value).trim();
    if (!q) return;
    showLoader();
    try {
        const lists = await Promise.all(searchStorefronts.map(cc => fetchSearchStore(q, cc, 30)));
        const seen = new Set();
        const merged = [];
        lists.flat().forEach(s => {
            const id = s.trackId || `${s.trackName}-${s.artistName}`;
            if (seen.has(id)) return;
            seen.add(id);
            merged.push(s);
        });
        currentSongs = merged;
        showView("search");
        renderSongs(currentSongs, songContainer);
        if (searchCount) searchCount.textContent = `${currentSongs.length} tracks`;
        const resultsSection = document.getElementById("searchView");
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    } catch (error) {
        console.log(error);
        showToast("Unable to fetch songs", "#ef4444");
    }
    hideLoader();
}

// --- SEARCH EVENT (Manual - Enter key or Button Click) ---

document.getElementById("searchBtn").addEventListener("click", () => {
    runSearch(searchInput.value.trim());
});

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        runSearch(searchInput.value.trim());
    }
});

// --- LIVE SEARCH (results appear as the user types) ---

let liveTimer = null;
let liveSeq = 0;

function debouncedLiveSearch() {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(async () => {
        const q = searchInput.value.trim();
        if (!q) return;
        const seq = ++liveSeq;
        try {
            const lists = await Promise.all(
                searchStorefronts.map(cc => fetchSearchStore(q, cc, 30))
            );
            if (seq !== liveSeq) return;                // stale response — ignore
            const seen = new Set();
            const merged = [];
            lists.flat().forEach(s => {
                const id = s.trackId || `${s.trackName}-${s.artistName}`;
                if (seen.has(id)) return;
                seen.add(id);
                merged.push(s);
            });
            currentSongs = merged;
            renderSongs(currentSongs, songContainer);
            if (searchCount) searchCount.textContent = `${currentSongs.length} tracks`;
        } catch (error) {
            // ignore transient type-ahead failures
        }
    }, 350);
}

searchInput.addEventListener("input", () => {
    if (!searchView.hidden) {
        debouncedLiveSearch();
    }
});

// --- TOP CHARTS (Real storefront charts, like Spotify/Apple Music) ---

const chartConfigs = [
    {
        id: "india",
        title: "India Top 50",
        sub: "Real-time top songs in India",
        gradient: "linear-gradient(135deg,#4f9df9,#1d4ed8)",
        cover: "images/chart-india.jpg"
    },
    {
        id: "global",
        title: "Global Top 50",
        sub: "Biggest hits across the world",
        gradient: "linear-gradient(135deg,#a855f7,#6d28d9)",
        cover: "images/chart-global.jpg"
    },
    {
        id: "bollywood",
        title: "Bollywood Top 50",
        sub: "Top Hindi & Bollywood hits",
        gradient: "linear-gradient(135deg,#f97316,#dc2626)",
        cover: "images/chart-bollywood.jpg"
    },
    {
        id: "hollywood",
        title: "Hollywood Top 50",
        sub: "Biggest English-language hits",
        gradient: "linear-gradient(135deg,#10b981,#047857)",
        cover: "images/chart-hollywood.jpg"
    }
];

const globalStorefronts = ["us", "gb", "au", "de", "fr", "in", "ca"];

const hindiChartTerms = [
    "arijit singh", "atif aslam", "shreya ghoshal", "neha kakkar",
    "hindi hits", "bollywood hits", "punjabi hits", "badshah",
    "diljit dosanjh", "jubin nautiyal", "hindi pop", "b Praak"
];

function parseRssEntry(entry, i) {
    const frames = entry["im:image"] || [];
    const img = (frames[frames.length - 1]?.label || frames[0]?.label || "")
        .replace(/170x170bb/, "100x100bb");
    const previewLink = (entry.link || []).find(l =>
        l?.attributes && (l.attributes.rel === "preview" || l.attributes.type === "audio/x-m4a")
    ) || (entry.link || [])[0];
    return {
        trackId: entry["id"]?.attributes?.["im:id"] || String(i),
        trackName: entry["im:name"]?.label || "Unknown Track",
        artistName: entry["im:artist"]?.label || "Unknown Artist",
        artworkUrl100: img,
        previewUrl: previewLink?.attributes?.href || ""
    };
}

async function fetchStoreChart(cc, limit = 20) {
    const res = await fetch(`https://itunes.apple.com/${cc}/rss/topsongs/limit=${limit}/json`);
    const data = await res.json();
    const entries = data?.feed?.entry || [];
    return entries.map(parseRssEntry).filter(s => s.previewUrl && s.trackName !== "Unknown Track");
}

async function loadChartIndia() {
    return (await fetchStoreChart("in", 50)).slice(0, 50);
}

async function loadChartHollywood() {
    return (await fetchStoreChart("us", 50)).slice(0, 50);
}

async function loadChartGlobal() {
    const lists = await Promise.all(globalStorefronts.map(cc => fetchStoreChart(cc, 15).catch(() => [])));
    const freq = new Map();
    const first = new Map();
    lists.flat().forEach(s => {
        freq.set(s.trackId, (freq.get(s.trackId) || 0) + 1);
        if (!first.has(s.trackId)) first.set(s.trackId, s);
    });
    const ranked = [...freq.entries()]
        .sort((a, b) => b[1] - a[1] || (first.get(a[0]).trackName.localeCompare(first.get(b[0]).trackName)))
        .slice(0, 50);
    return ranked.map(([id]) => first.get(id));
}

async function loadChartBollywood() {
    const allResults = [];
    for (const term of hindiChartTerms) {
        const res = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=10&country=IN`
        );
        const data = await res.json();
        if (data.results) allResults.push(...data.results);
    }
    const freq = new Map();
    const first = new Map();
    allResults.filter(s => s.previewUrl).forEach(s => {
        freq.set(s.trackId, (freq.get(s.trackId) || 0) + 1);
        if (!first.has(s.trackId)) first.set(s.trackId, s);
    });
    const ranked = [...freq.entries()]
        .sort((a, b) => b[1] - a[1] || (first.get(a[0]).trackName.localeCompare(first.get(b[0]).trackName)))
        .slice(0, 50);
    return ranked.map(([id]) => first.get(id));
}

let chartData = {};

async function loadCharts() {
    try {
        const [india, global, bollywood, hollywood] = await Promise.all([
            loadChartIndia().catch(() => []),
            loadChartGlobal().catch(() => []),
            loadChartBollywood().catch(() => []),
            loadChartHollywood().catch(() => [])
        ]);
        chartData = { india, global, bollywood, hollywood };
        renderChartCards();
        if (!document.querySelector(".chart-card")) throw new Error("chart render failed");
    } catch (err) {
        console.log(err);
        chartGrid.innerHTML = `
            <div class="empty">
                <i class="fa-solid fa-chart-simple"></i>
                Charts unavailable — check your connection.
            </div>`;
    }
}

function renderChartCards() {
    chartGrid.innerHTML = chartConfigs.map((cfg) => `
        <div class="chart-card" style="background-image:url('${cfg.cover}')" data-chart="${cfg.id}" role="button" tabindex="0">
            <div class="chart-card-body">
                <h3>${cfg.title}</h3>
                <p>${cfg.sub}</p>
            </div>
        </div>
    `).join("");
    document.querySelectorAll(".chart-card").forEach(card => {
        const id = card.dataset.chart;
        const open = () => openChart(id);
        card.addEventListener("click", open);
        card.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
        });
    });
}

function openChart(id) {
    const cfg = chartConfigs.find(c => c.id === id);
    const songs = chartData[id] || [];
    window.currentChartData = songs;
    chartTitle.textContent = cfg.title;
    chartSub.textContent = `${cfg.sub} · ${songs.length} tracks`;
    renderChartList(songs);
    chartPanelInline.hidden = false;
    chartPanelInline.classList.add("open");
    setTimeout(() => {
        if (chartPanelInline.getBoundingClientRect().top < 0) {
            chartPanelInline.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, 80);
}

function renderChartList(songs) {
    chartList.innerHTML = "";
    if (!songs.length) {
        chartList.innerHTML = `
            <div class="empty">
                <i class="fa-solid fa-chart-simple"></i>
                Chart unavailable — try again later.
            </div>`;
        return;
    }
    songs.forEach((song, index) => {
        const row = document.createElement("div");
        row.className = "chart-row";
        row.dataset.trackid = song.trackId;
        row.innerHTML = `
            <span class="row-rank">${index + 1}</span>
            <div class="row-art">
                <img src="${song.artworkUrl100.replace("100x100", "300x300")}" alt="">
                <span class="row-eq"><i></i><i></i><i></i></span>
            </div>
            <div class="row-info">
                <h4>${song.trackName}</h4>
                <p>${song.artistName}</p>
            </div>
            <span class="row-dur">#${index + 1}</span>
            <button class="row-play" onclick="playSong(${index}, 'chartList')">
                <i class="fa-solid fa-play"></i>
            </button>
        `;
        chartList.appendChild(row);
    });
}

if (chartClose) chartClose.addEventListener("click", closeChartPanel);

function closeChartPanel() {
    if (!chartPanelInline) return;
    chartPanelInline.classList.remove("open");
    chartPanelInline.hidden = true;
}

// --- HERO TRENDING MARQUEE (Real live charts + all genres mix) ---

// Real top-chart feeds per region — these are the genuinely trending songs right now.
const heroRegions = [
    { cc: "in", label: "India" },
    { cc: "us", label: "Global" },
    { cc: "gb", label: "UK" },
    { cc: "au", label: "Australia" },
    { cc: "de", label: "Germany" },
    { cc: "fr", label: "France" },
    { cc: "ca", label: "Canada" },
    { cc: "jp", label: "Japan" }
];

// Genre search terms — keep every vibe/frag in the mix.
const heroGenreTerms = [
    { genre: "Bollywood", terms: ["arijit singh", "shreya ghoshal", "neha kakkar", "bollywood hits"] },
    { genre: "Punjabi", terms: ["diljit dosanjh", "sidhu moose wa", "AP Dhillon", "karan aujla"] },
    { genre: "English", terms: ["the weeknd", "ed sheeran", "taylor swift", "dua lipa"] },
    { genre: "Desi", terms: ["badshah", "divine", "king", "krsna"] },
    { genre: "South", terms: ["a r rahman", "anirudh ravichander", "devi sri prasad", "sid sriram"] },
    { genre: "Old", terms: ["kishore kumar", "lata mangeshkar", "mohammed rafi", "aas bhosle"] },
    { genre: "Trending", terms: ["top songs 2026", "viral songs", "hottest hits", "charts"] },
    { genre: "Global Pop", terms: ["abel tesfaye", "bruno mars", "coldplay", "justin bieber"] },
    { genre: "Lo-fi", terms: ["lofi beats", "lofi hip hop", "chill vibes", "coffee house"] }
];

let heroSongs = [];

async function loadHeroMarquee() {
    try {
        const allResults = [];

        // 1) Real live charts — current region trending lists
        const regionLists = await Promise.all(
            heroRegions.map(({ cc, label }) =>
                fetchStoreChart(cc, 15)
                    .then(rows => rows.map(s => ({ ...s, _genre: label })))
                    .catch(() => [])
            )
        );
        regionLists.flat().forEach(s => allResults.push(s));

        // 2) Genre mix — every type of song available on the store
        const genreJobs = heroGenreTerms.flatMap(group =>
            group.terms.map(term => ({ term, genre: group.genre }))
        );
        const genreBatches = await Promise.all(
            genreJobs.map(async ({ term, genre }) => {
                const res = await fetch(
                    `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=20`
                );
                const data = await res.json();
                return (data.results || []).filter(s => s.previewUrl).map(s => ({ ...s, _genre: genre }));
            }).map(p => p.catch(() => []))
        );
        genreBatches.flat().forEach(s => allResults.push(s));

        const seen = new Set();
        const unique = allResults.filter(s => {
            const key = s.trackId || `${s.trackName}-${s.artistName}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Rotate so every login/pageload shows a different fresh set
        unique.sort(() => Math.random() - 0.5);
        const start = Math.floor(Math.random() * Math.max(unique.length - 30, 0));
        heroSongs = unique.length > 30 ? unique.slice(start, start + 30) : unique;
        renderHeroMarquee();
    } catch (err) {
        console.log(err);
    }
}

function renderHeroMarquee() {
    const track = document.getElementById("heroTrack");
    if (!track) return;
    if (!heroSongs.length) {
        track.innerHTML = `<div class="empty">Trending tracks are taking a breather — check back soon.</div>`;
        return;
    }
    const doubled = [...heroSongs, ...heroSongs];
    track.innerHTML = doubled.map((song, index) => `
        <div class="hero-card" data-trackid="${song.trackId}" onclick="playHeroSong(${index})">
            <div class="hc-art">
                <img src="${song.artworkUrl100.replace("100x100", "500x500")}" alt="${song.trackName}">
                <span class="hc-genre"><i class="fa-solid fa-headphones"></i>${song._genre}</span>
                <button class="hc-play" aria-label="Play ${song.trackName}">
                    <i class="fa-solid fa-play"></i>
                </button>
            </div>
            <div class="hc-info">
                <h4>${song.trackName}</h4>
                <p>${song.artistName}</p>
            </div>
        </div>
    `).join("");
}

function playHeroSong(index) {
    playSong(index % heroSongs.length, "heroSongs");
}

// --- RENDER SONGS (list rows, like a real music app) ---

function formatTrackTime(ms) {
    if (!ms) return "";
    const total = Math.round(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function renderSongs(songs, container) {
    container.innerHTML = "";
    if (!songs || songs.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <i class="fa-solid fa-headphones"></i>
                No Songs Found
            </div>
        `;
        return;
    }
    const list = document.createElement("div");
    list.className = "song-list-inner";
    songs.forEach((song, index) => {
        const row = document.createElement("div");
        row.className = "chart-row song-row-app";
        row.dataset.trackid = song.trackId;
        row.innerHTML = `
            <span class="row-rank">${index + 1}</span>
            <div class="row-art">
                <img src="${song.artworkUrl100.replace("100x100", "300x300")}" alt="${song.trackName}">
                <span class="row-eq"><i></i><i></i><i></i></span>
            </div>
            <div class="row-info">
                <h4>${song.trackName}</h4>
                <p>${song.artistName}</p>
            </div>
            <span class="row-dur">${formatTrackTime(song.trackTimeMillis)}</span>
            <button class="row-play" onclick="playSong(${index}, '${container.id}')" aria-label="Play ${song.trackName}">
                <i class="fa-solid fa-play"></i>
            </button>
        `;
        list.appendChild(row);
    });
    container.appendChild(list);
}

// --- GET SONG ARRAY ---

function getSongArray(containerId) {
    switch (containerId) {
        case "heroSongs":
            return heroSongs;
        case "chartList":
            return window.currentChartData || [];
        case "recentContainer":
            return recentSongs;
        default:
            return currentSongs;
    }
}

// --- INITIAL EMPTY STATE FOR RECENT ---

if (recentSongs.length === 0) {
    recentContainer.innerHTML = `
        <div class="empty">
            <i class="fa-solid fa-clock-rotate-left"></i>
            Recently played songs will appear here
        </div>`;
}

// --- ACTIVE TRACK HIGHLIGHT ---

function syncActiveCard() {
    document.querySelectorAll(".song-card, .hero-card, .chart-row").forEach(card => {
        const isActive = card.dataset.trackid === String(currentPlaylist[currentIndex]?.trackId);
        card.classList.toggle("is-playing", isActive);
        const btn = card.querySelector(".play-btn, .hc-play, .row-play");
        const icon = btn?.querySelector("i");
        if (btn && icon) {
            icon.className = isActive && isPlaying
                ? "fa-solid fa-pause"
                : "fa-solid fa-play";
        }
    });
}

// --- PLAY SONG ---

function playSong(index, containerId) {
    currentPlaylist = getSongArray(containerId);
    currentContainerId = containerId;
    currentIndex = index;
    const song = currentPlaylist[currentIndex];
    if (!song.previewUrl) {
        showToast("Preview not available", "#ef4444");
        return;
    }
    audioPlayer.src = song.previewUrl;
    playerImage.src = song.artworkUrl100.replace("100x100", "500x500");
    playerSong.textContent = song.trackName;
    playerArtist.textContent = song.artistName;
    if (durTime) durTime.textContent = "0:30";
    audioPlayer.play();
    isPlaying = true;
    playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    playBtn.classList.add("playing");
    player.classList.add("is-playing");
    player.classList.add("show");
    addRecent(song);
    syncActiveCard();
}

// --- PLAY / PAUSE ---

playBtn.addEventListener("click", () => {
    if (!audioPlayer.src) return;
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
        playBtn.classList.remove("playing");
        player.classList.remove("is-playing");
    } else {
        audioPlayer.play();
        isPlaying = true;
        playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        playBtn.classList.add("playing");
        player.classList.add("is-playing");
        player.classList.add("show");
    }
    syncActiveCard();
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
        const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = pct;
        updateRangeFill(progressBar);
        if (curTime) curTime.textContent = formatTime(audioPlayer.currentTime);
    }
});

audioPlayer.addEventListener("loadedmetadata", () => {
    if (durTime && audioPlayer.duration) {
        durTime.textContent = formatTime(audioPlayer.duration);
    }
});

// --- SEEK ---

progressBar.addEventListener("input", () => {
    if (audioPlayer.duration) {
        audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
        if (curTime) curTime.textContent = formatTime(audioPlayer.currentTime);
    }
    updateRangeFill(progressBar);
});

// --- VOLUME ---

volumeBar.addEventListener("input", () => {
    audioPlayer.volume = volumeBar.value;
    updateRangeFill(volumeBar);
});

// --- SPACEBAR PLAY/PAUSE ---

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        const el = document.activeElement;
        const isTyping = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
        const isInteractive = el && el.closest("button, [role='button'], a, select");
        if (isTyping || isInteractive) return;
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
    this.src = "https://placehold.co/300x300/eef4fc/2563eb?text=Harmony";
};

// --- AUDIO ERROR / READY ---

audioPlayer.addEventListener("error", () => {
    showToast("Unable to play preview", "#ef4444");
});

audioPlayer.addEventListener("canplay", () => {
    hideLoader();
});

// --- RECENTLY PLAYED ---

function addRecent(song) {
    recentSongs = recentSongs.filter(item => item.trackId !== song.trackId);
    recentSongs.unshift(song);
    if (recentSongs.length > 10) recentSongs.pop();
    localStorage.setItem(userKey("recentSongs"), JSON.stringify(recentSongs));
    renderRecent();
}

function renderRecent() {
    recentContainer.innerHTML = "";
    if (recentSongs.length === 0) {
        recentContainer.innerHTML = `
            <div class="empty">
                <i class="fa-solid fa-clock-rotate-left"></i>
                No Recently Played Songs
            </div>
        `;
        return;
    }
    recentSongs.forEach((song, index) => {
        const card = document.createElement("div");
        card.className = "song-card";
        card.dataset.trackid = song.trackId;
        card.innerHTML = `
            <div class="art-box">
                <img src="${song.artworkUrl100.replace("100x100", "500x500")}" alt="${song.trackName}">
                <span class="card-eq"><i></i><i></i><i></i><i></i></span>
                <button
                    class="play-btn"
                    onclick="playSong(${index},'recentContainer')"
                    aria-label="Play ${song.trackName}">
                    <i class="fa-solid fa-play"></i>
                </button>
            </div>
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
    localStorage.removeItem(userKey("recentSongs"));
    renderRecent();
    showToast("History cleared");
}

if (clearRecentBtn) {
    clearRecentBtn.addEventListener("click", clearRecent);
}

// --- SAVE LAST PLAYED ---

audioPlayer.addEventListener("play", () => {
    if (currentPlaylist.length === 0) return;
    localStorage.setItem(userKey("lastSong"), JSON.stringify(currentPlaylist[currentIndex]));
});

// --- ESC CLOSE CHART PANEL ---

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && chartPanelInline && !chartPanelInline.hidden) {
        closeChartPanel();
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
    localStorage.setItem(userKey("volume"), volumeBar.value);
});

// --- RESTORE VOLUME ---

const savedVolume = localStorage.getItem(userKey("volume"));
if (savedVolume) {
    audioPlayer.volume = savedVolume;
    volumeBar.value = savedVolume;
}

// --- ONLINE STATUS ---

window.addEventListener("offline", () => {
    showToast("Internet connection lost", "#ef4444");
});

window.addEventListener("online", () => {
    showToast("Connected");
});

// --- IMAGE FALLBACK ---

document.addEventListener("error", (e) => {
    if (e.target.tagName === "IMG") {
        e.target.src = "https://placehold.co/300x300/eef4fc/2563eb?text=Harmony";
    }
}, true);

// --- RESTORE LAST SONG ON LOAD ---

window.addEventListener("load", () => {
    const lastSong = JSON.parse(localStorage.getItem(userKey("lastSong")));
    if (!lastSong) return;
    playerImage.src = lastSong.artworkUrl100.replace("100x100", "500x500");
    playerSong.textContent = lastSong.trackName;
    playerArtist.textContent = lastSong.artistName;
});

// --- APP INITIALIZATION ---

function initializeApp() {
    if (window.matchMedia("(max-width: 640px)").matches) {
        searchInput.placeholder = "Search songs, artists…";
    }
    loadHeroMarquee();
    loadCharts();
    renderRecent();
    updateRangeFill(volumeBar);
    updateRangeFill(progressBar);
    if (!savedVolume) {
        audioPlayer.volume = 1;
        volumeBar.value = 1;
    }
}

initializeApp();

// --- WELCOME MESSAGE ---

setTimeout(() => {
    if (user) showToast(`Welcome back, ${user.username}`);
}, 1000);

// --- CLICK ANIMATION ---

document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
        btn.style.transform = "scale(.96)";
        setTimeout(() => {
            btn.style.transform = "";
        }, 120);
    });
});

// --- CONSOLE MESSAGE ---

console.log("%cHarmony Music Player", "color:#2563eb;font-size:20px;font-weight:bold");