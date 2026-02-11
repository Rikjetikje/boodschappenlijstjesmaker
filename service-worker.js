const CACHE = "blm-cache-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Always fetch a fresh index.html to avoid stale GitHub Pages caching
  if (req.method === "GET" && req.url.includes("/boodschappenlijstjesmaker/") && req.url.endsWith("index.html")) {
    event.respondWith(fetch(req, { cache: "no-store" }));
    return;
  }

  // Network-first for everything else; fallback to cache
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req))
  );
});
