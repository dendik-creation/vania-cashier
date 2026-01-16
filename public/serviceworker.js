var staticCacheName = "pwa-v" + new Date().getTime();
var filesToCache = [
    "/assets/css/main.css",
    "/assets/img/user_icon.png",
    "/js/app.js",
    "/assets/fonts/SpaceGrotesk-Light.ttf",
    "/assets/fonts/SpaceGrotesk-Regular.ttf",
    "/assets/fonts/SpaceGrotesk-Medium.ttf",
    "/assets/fonts/SpaceGrotesk-SemiBold.ttf",
    "/assets/fonts/SpaceGrotesk-Bold.ttf",
    "/icon_512.png",
    "/favicon.ico",
    "/assets/xlsx-format/import-produk.xlsx",
];

// Cache on install
self.addEventListener("install", (event) => {
    this.skipWaiting();
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            return cache.addAll(filesToCache);
        }),
    );
});

// Clear cache on activate
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName.startsWith("pwa-"))
                    .filter((cacheName) => cacheName !== staticCacheName)
                    .map((cacheName) => caches.delete(cacheName)),
            );
        }),
    );
});

// Serve from Cache
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches
            .match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
            .catch(() => {
                return caches.match("offline");
            }),
    );
});
