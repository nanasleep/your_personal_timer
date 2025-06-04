// sw.js (Service Worker)

const CACHE_NAME = 'widget-sayangku-v1'; // Nama cache, ubah jika ada update aset
const urlsToCache = [
    '/', // Ini penting untuk meng-cache root folder
    'index.html',
    'style.css',
    'script.js',
    'semangat.json',
    'apresiasi.json',
    'chara.png',
    'audio/start.mp3',
    'audio/drink.mp3',
    'audio/break.mp3',
    'audio/finish.mp3',
    'icons/icon-192x192.png',
    'icons/icon-512x512.png'
    // Tambahkan semua aset lain yang kamu ingin bisa diakses offline di sini
];

// Event: Install (Saat service worker pertama kali diinstal)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching App Shell');
                return cache.addAll(urlsToCache); // Menyimpan semua aset ke cache
            })
    );
});

// Event: Activate (Saat service worker baru mengambil alih kendali)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName); // Menghapus cache lama
                    }
                })
            );
        })
    );
});

// Event: Fetch (Saat browser meminta aset dari jaringan)
self.addEventListener('fetch', (event) => {
    // Coba mencari di cache dulu, jika tidak ada baru dari jaringan
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response; // Ditemukan di cache
                }
                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request); // Tidak di cache, ambil dari jaringan
            })
    );
});