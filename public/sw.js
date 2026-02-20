const PRECACHE = "ngau-precache-v1";
const RUNTIME = "ngau-runtime-v1";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./site.webmanifest",
  "./favicon.svg",
  "./og-image.svg",
  "./content-pages.css",
  "./how-to-play-ngau.html",
  "./ngau-rules-explained.html",
  "./ngau-3-6-explained.html",
  "./ngau-example-rounds.html",
  "./ngau-faq.html",
  "./zh-hant/how-to-play-ngau.html",
  "./zh-hant/ngau-rules-explained.html",
  "./zh-hant/ngau-3-6-explained.html",
  "./zh-hant/ngau-example-rounds.html",
  "./zh-hant/ngau-faq.html",
  "./zh-hans/how-to-play-ngau.html",
  "./zh-hans/ngau-rules-explained.html",
  "./zh-hans/ngau-3-6-explained.html",
  "./zh-hans/ngau-example-rounds.html",
  "./zh-hans/ngau-faq.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      await cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: "reload" })));
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== PRECACHE && key !== RUNTIME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          const runtimeCache = await caches.open(RUNTIME);
          runtimeCache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (_error) {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          return caches.match("./index.html");
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

      const networkResponse = await fetch(event.request);
      if (networkResponse.ok && networkResponse.type === "basic") {
        const runtimeCache = await caches.open(RUNTIME);
        runtimeCache.put(event.request, networkResponse.clone());
      }
      return networkResponse;
    })()
  );
});
