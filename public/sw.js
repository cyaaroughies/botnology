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

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=> self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  if (url.pathname.startsWith("/api/")) {
    e.respondWith(fetch(req));
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(()=> caches.match("/index.html")))
  );
});
