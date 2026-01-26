// Botnology101 Service Worker

const CACHE = "bn-cache-v2"; // Updated cache version
const ASSETS = [
  "/",
  "/index.html",
  "/pricing.html",
  "/dashboard.html",
  "/style.css?v=2", // Cache-busted
  "/script.js?v=2", // Cache-busted
  "/dr-botonic.jpeg",
  "/manifest.json"
];

// Install: cache core assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches if needed
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: respond from cache, then update cache in background
self.addEventListener("fetch", (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req)
        .then(res => {
          // Only cache GET requests and successful responses
          if (req.method === "GET" && res.status === 200 && res.type === "basic") {
            const resClone = res.clone();
            caches.open(CACHE).then(cache => cache.put(req, resClone)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});