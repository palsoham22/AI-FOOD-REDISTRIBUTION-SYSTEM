// FoodBridge AI Service Worker
// Versioned cache name: bump when offline assets or caching logic changes
const CACHE_NAME = "foodbridge-v3";
const PRECACHE_PREFIX = "foodbridge-";

const urlsToCache = [
  "/",
  "/manifest.json"
];

// =============================
// Installation
// =============================
self.addEventListener("install", (event) => {
  console.log("✅ Service Worker Installed (v3)");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );

  self.skipWaiting();
});

// =============================
// Activation & Cache Cleanup
// =============================
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker Activated (v3)");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete only old caches belonging to this application's service worker
          if (cacheName.startsWith(PRECACHE_PREFIX) && cacheName !== CACHE_NAME) {
            console.log("🗑️ Deleting old service worker cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// =============================
// Fetch Strategies
// =============================

// Network-first strategy for navigation requests (HTML/homepage)
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put("/", networkResponse.clone()).catch((err) => {
        console.warn("Failed to update cached homepage:", err);
      });
    }
    return networkResponse;
  } catch (error) {
    console.warn("Navigation fetch failed, using offline fallback:", error);
    const cachedResponse = (await caches.match("/")) || (await caches.match(request));
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response("Offline - Page not available", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain" }
    });
  }
}

// Network-first strategy for web app manifest
async function handleManifestRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put("/manifest.json", networkResponse.clone()).catch((err) => {
        console.warn("Failed to update cached manifest:", err);
      });
    }
    return networkResponse;
  } catch (error) {
    console.warn("Manifest fetch failed, using offline fallback:", error);
    const cachedResponse = (await caches.match("/manifest.json")) || (await caches.match(request));
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "application/json" }
    });
  }
}

self.addEventListener("fetch", (event) => {
  // 1. Only intercept GET requests
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // 2. Do not intercept cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // 3. Do not intercept API, authentication, or backend endpoints
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // 4. Page navigation requests (including root '/'): network-first with offline fallback
  if (event.request.mode === "navigate" || url.pathname === "/") {
    event.respondWith(handleNavigationRequest(event.request));
    return;
  }

  // 5. PWA Manifest: network-first with offline fallback
  if (url.pathname === "/manifest.json") {
    event.respondWith(handleManifestRequest(event.request));
    return;
  }

  // 6. Do not intercept any other requests (static assets, images, etc. handled by browser/CDN)
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
