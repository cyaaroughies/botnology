const CACHE = "bn-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/pricing.html",
  "/dashboard.html",
  "/style.css",
  "/script.js",
  "/dr-botonic.png",
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
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(()=> caches.match("/index.html")))
  );
});
