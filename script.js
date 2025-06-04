// script.js

// --- Elemen DOM ---
const workTimerDisplay = document.getElementById('work-timer');
const drinkTimerDisplay = document.getElementById('drink-timer');
const breakTimerDisplay = document.getElementById('break-timer');
const manualTimerInput = document.getElementById('manual-timer-input');
const startManualTimerBtn = document.getElementById('start-manual-timer');
const resetTimerBtn = document.getElementById('reset-timer'); // PERBAIKAN: Sudah benar
const popupOverlay = document.getElementById('popup-overlay');
const popupMessage = document.getElementById('popup-message');
const closePopupBtn = document.querySelector('.close-popup');

// Audio elements
const audioStart = document.getElementById('audio-start');
const audioDrink = document.getElementById('audio-drink');
const audioBreak = document.getElementById('audio-break');
const audioFinish = document.getElementById('audio-finish');

// --- Variabel Timer & Interval ---
let workTimeRemaining = 0; // Waktu kerja dalam detik
let drinkTimeRemaining = 15 * 60; // 15 menit untuk minum
let breakTimeRemaining = 25 * 60; // 25 menit untuk istirahat

let workTimerInterval = null;
let isTimerRunning = false;
let hasGreetedOnLoad = false; // Flag baru untuk memastikan greeting hanya muncul sekali

// --- Fungsi Helper ---

// Fungsi untuk format waktu menjadi HH:MM:SS atau MM:SS
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        return [h, m, s]
            .map(v => v < 10 ? '0' + v : v)
            .join(':');
    } else {
        return [m, s]
            .map(v => v < 10 ? '0' + v : v)
            .join(':');
    }
}

// Fungsi untuk menampilkan pop-up dan Notifikasi Sistem
function showPopup(message) {
    popupMessage.textContent = message;
    popupOverlay.style.display = 'flex'; // Menampilkan pop-up internal

    // >>> TAMBAHAN: Logika Notifikasi Sistem <<<
    if (Notification.permission === 'granted') {
        new Notification('Your Personal Timer', { // Judul notifikasi
            body: message,
            icon: 'icons/icon-192x192.png' // Ikon notifikasi sistem
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Your Personal Timer', {
                    body: message,
                    icon: 'icons/icon-192x192.png'
                });
            }
        });
    }
    // >>> AKHIR TAMBAHAN <<<
}

// Fungsi untuk menyembunyikan pop-up
function hidePopup() {
    popupOverlay.style.display = 'none'; // Menyembunyikan pop-up
}

// Fungsi untuk memutar suara
function playAudio(audioElement) {
    audioElement.currentTime = 0;
    audioElement.play().catch(e => console.error("Error playing audio:", e));
}

// --- Logika Timer Utama ---

// Fungsi untuk update dan display timer
function updateTimers() {
    // Update Work Timer
    if (workTimeRemaining > 0) {
        workTimeRemaining--;
        workTimerDisplay.textContent = formatTime(workTimeRemaining);
    } else if (workTimeRemaining === 0 && isTimerRunning) {
        // Timer kerja selesai
        resetAllTimers(); // Hentikan semua interval dan reset
        playAudio(audioFinish);
        showRandomAppreciation(); // Tampilkan apresiasi setelah timer selesai
    }

    // Update Drink Reminder
    if (drinkTimeRemaining > 0) {
        drinkTimeRemaining--;
        drinkTimerDisplay.textContent = formatTime(drinkTimeRemaining);
    } else {
        playAudio(audioDrink);
        showPopup("Minum duluu gihhh, Jangan sampe kurang minum, apalagi dehidrasi");
        drinkTimeRemaining = 15 * 60; // Reset 15 menit
    }

    // Update Break Reminder
    if (breakTimeRemaining > 0) {
        breakTimeRemaining--;
        breakTimerDisplay.textContent = formatTime(breakTimeRemaining);
    } else {
        playAudio(audioBreak);
        showPopup("Waktunya istirahat dulu bentarrr, Regangkan badanmu ya!");
        breakTimeRemaining = 25 * 60; // Reset 25 menit
    }
}

// Fungsi untuk memulai semua timer
function startAllTimers() {
    if (isTimerRunning) {
        if (workTimerInterval !== null) return; // Mencegah multiple intervals
    }

    isTimerRunning = true;
    playAudio(audioStart);

    workTimerInterval = setInterval(updateTimers, 1000);

    workTimerDisplay.textContent = formatTime(workTimeRemaining);
    drinkTimerDisplay.textContent = formatTime(drinkTimeRemaining);
    breakTimerDisplay.textContent = formatTime(breakTimeRemaining);
}

// Fungsi untuk mereset semua timer
function resetAllTimers() {
    if (workTimerInterval !== null) {
        clearInterval(workTimerInterval);
        workTimerInterval = null;
    }

    isTimerRunning = false;

    workTimeRemaining = 0;
    drinkTimeRemaining = 15 * 60;
    breakTimeRemaining = 25 * 60;

    workTimerDisplay.textContent = formatTime(workTimeRemaining);
    drinkTimerDisplay.textContent = formatTime(drinkTimeRemaining);
    breakTimerDisplay.textContent = formatTime(breakTimeRemaining);

    hidePopup();
}

// --- Event Listeners ---

// Memulai timer manual
startManualTimerBtn.addEventListener('click', () => {
    const minutesInput = manualTimerInput.value;
    const minutes = parseInt(minutesInput, 10);

    if (!isNaN(minutes) && minutes > 0) {
        resetAllTimers();
        workTimeRemaining = minutes * 60;
        startAllTimers();
        manualTimerInput.value = '';
    } else {
        alert("Mohon masukkan angka durasi kerja yang valid (dalam menit). Contoh: 60 untuk 60 menit.");
    }
});

// Mereset timer
resetTimerBtn.addEventListener('click', resetAllTimers);

// Menutup pop-up
closePopupBtn.addEventListener('click', hidePopup);
popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) {
        hidePopup();
    }
});

// --- Inisialisasi Awal ---

// Fungsi untuk menampilkan kata semangat saat aplikasi dibuka
async function showRandomGreeting() {
    if (hasGreetedOnLoad) return;
    hasGreetedOnLoad = true;

    try {
        const response = await fetch('semangat.json');
        const greetings = await response.json();
        const randomIndex = Math.floor(Math.random() * greetings.length);
        showPopup(greetings[randomIndex]);
    } catch (error) {
        console.error('Error loading greetings:', error);
        showPopup("Halouuww sayangku! Buat hari ini juga tetep semangat ya!"); // Fallback message
    }
}

// Fungsi untuk menampilkan apresiasi saat timer selesai
async function showRandomAppreciation() {
    try {
        const response = await fetch('apresiasi.json');
        const appreciations = await response.json();
        const randomIndex = Math.floor(Math.random() * appreciations.length);
        showPopup(appreciations[randomIndex]);
    } catch (error) {
        console.error('Error loading appreciations:', error);
        showPopup("Kerja bagus, sayangku! Kamu hebat!"); // Fallback message
    }
}

// Tampilkan kata semangat saat halaman dimuat PERTAMA KALI
document.addEventListener('DOMContentLoaded', showRandomGreeting);

// Inisialisasi display timer saat pertama kali halaman dimuat
workTimerDisplay.textContent = formatTime(workTimeRemaining);
drinkTimerDisplay.textContent = formatTime(drinkTimeRemaining);
breakTimerDisplay.textContent = formatTime(breakTimeRemaining);

// --- Drag-and-Drop Fungsionalitas ---
const widgetContainer = document.querySelector('.container');

let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

// Fungsi untuk memulai proses drag
function dragStart(e) {
    if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }

    // Pastikan kita hanya drag jika klik bukan di tombol atau input
    if (e.target === startManualTimerBtn ||
        e.target === resetTimerBtn ||
        e.target === manualTimerInput ||
        e.target === closePopupBtn ||
        e.target === popupOverlay ||
        e.target.closest('.popup-content')) {
        return;
    }

    isDragging = true;
    widgetContainer.style.cursor = 'grabbing';
}

// Fungsi saat proses drag berlangsung
function drag(e) {
    if (isDragging) {
        e.preventDefault();

        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, widgetContainer);
    }
}

// Fungsi untuk mengakhiri proses drag
function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
    widgetContainer.style.cursor = 'grab';
}

// Fungsi untuk menerapkan transformasi posisi
function setTranslate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
}

// --- Menambahkan Event Listener untuk Dragging ---
widgetContainer.addEventListener("mousedown", dragStart);
widgetContainer.addEventListener("mouseup", dragEnd);
widgetContainer.addEventListener("mousemove", drag);

// Tambahan untuk dukungan sentuhan (mobile/layar sentuh)
widgetContainer.addEventListener("touchstart", dragStart);
widgetContainer.addEventListener("touchend", dragEnd);
widgetContainer.addEventListener("touchmove", drag);

// --- PWA (Progressive Web App) Registrasi Service Worker ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('Service Worker registered! Scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}