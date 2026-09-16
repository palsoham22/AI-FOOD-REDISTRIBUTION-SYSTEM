// Bump this whenever install metadata (such as the PWA icon manifest) changes.
const CACHE_NAME = "foodbridge-v2";

const urlsToCache = [
  "/",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  console.log("✅ Service Worker Installed");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker Activated");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// =============================
// Background Sync
// =============================

self.addEventListener("sync", (event) => {

  console.log("🔄 Background Sync:", event.tag);

  if (event.tag === "foodbridge-sync") {

    event.waitUntil(syncPendingRequests());

  }

});

async function syncPendingRequests() {

  console.log("📡 Internet is back!");

  // We'll implement actual sync logic next.
}
